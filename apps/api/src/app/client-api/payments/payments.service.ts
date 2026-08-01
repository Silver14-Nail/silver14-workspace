import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';

import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { OrderItemEntity } from '@/db/entities/orders/order-item.entity';
import { CustomSizeRequestEntity } from '@/db/entities/orders/custom-size-request.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import { PaypalDetailEntity } from '@/db/entities/payments/paypal-detail.entity';
import { CardDetailEntity } from '@/db/entities/payments/card-detail.entity';
import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponUsageEntity } from '@/db/entities/coupons/coupon-usage.entity';
import {
  CardBrand,
  CardProcessor,
  CheckoutSessionStatus,
  DiscountType,
  OrderStatus,
  PaymentGateway,
  PaymentStatus,
} from '@/common/enums/entity.enum';
import { StripeService } from '@/shared/payments/stripe.service';
import { PaypalService } from '@/shared/payments/paypal.service';

import { effectiveUnitPrice } from '@/shared/pricing/pricing.utils';

import { InitiateStripePaymentDto } from './dto/initiate-stripe-payment.dto';
import { ConfirmStripePaymentDto } from './dto/confirm-stripe-payment.dto';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from './dto/capture-paypal-order.dto';

const FREE_SHIPPING_THRESHOLD_USD = 100;

interface SessionTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
}

// Minimal shape of an expanded Stripe PaymentMethod (only fields we use)
interface ExpandedPaymentMethod {
  card: { last4: string; brand: string } | null;
}

@Injectable()
export class ClientPaymentsService {
  constructor(
    @InjectRepository(CheckoutSessionEntity)
    private readonly sessionRepo: Repository<CheckoutSessionEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    private readonly stripeService: StripeService,
    private readonly paypalService: PaypalService,
  ) {}

  // ─── Stripe ─────────────────────────────────────────────────────────────────

  async initiateStripePayment(dto: InitiateStripePaymentDto) {
    const session = await this.loadSessionOrFail(dto.checkoutSessionId);
    const totals = this.calculateTotals(session);

    const intent = await this.stripeService.createPaymentIntent(totals.total, totals.currency, {
      checkoutSessionId: session.id,
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: totals.total,
      currency: totals.currency,
    };
  }

  // Called directly by client after confirmCardPayment succeeds, or by Stripe webhook
  async fulfillStripePayment(
    paymentIntentId: string,
    checkoutSessionId: string,
  ): Promise<{ orderId: string }> {
    // Verify payment with Stripe first — prevents fake fulfillment requests
    const intent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

    if (intent.status !== 'succeeded') {
      throw new BadRequestException(`Payment has not succeeded (status: ${intent.status})`);
    }

    const intentMeta = intent.metadata as Record<string, string>;
    if (intentMeta?.checkoutSessionId !== checkoutSessionId) {
      throw new BadRequestException('Payment intent does not match this checkout session');
    }

    // Idempotent: if order already created by a concurrent call or webhook, return it
    const existingOrder = await this.paymentRepo.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: checkoutSessionId } },
      select: ['id'],
    });
    if (existingOrder) return { orderId: existingOrder.id };

    const session = await this.loadSessionOrFail(checkoutSessionId);

    const pm = intent.payment_method as unknown as ExpandedPaymentMethod | null;
    const totals = this.calculateTotals(session);

    let orderId!: string;
    await this.paymentRepo.manager.transaction(async (manager) => {
      const duplicate = await manager.findOne(OrderEntity, {
        where: { checkoutSession: { id: checkoutSessionId } },
        select: ['id'],
      });
      if (duplicate) {
        orderId = duplicate.id;
        return;
      }

      const order = await this.createOrder(manager, session, totals);
      orderId = order.id;

      const payment = manager.create(PaymentEntity, {
        order,
        gateway: PaymentGateway.STRIPE,
        gatewayTxnId: intent.id,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      if (pm?.card) {
        const card = manager.create(CardDetailEntity, {
          payment,
          processor: CardProcessor.STRIPE,
          last4: pm.card.last4,
          brand: pm.card.brand as CardBrand,
          authCode: null,
          chargeId: paymentIntentId,
        });
        await manager.save(CardDetailEntity, card);
      }

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);
    });

    return { orderId };
  }

  // ─── PayPal ─────────────────────────────────────────────────────────────────

  async createPaypalOrder(dto: CreatePaypalOrderDto) {
    const session = await this.loadSessionOrFail(dto.checkoutSessionId);
    const totals = this.calculateTotals(session);

    const order = await this.paypalService.createOrder(totals.total, totals.currency, session.id);

    return {
      paypalOrderId: order.id,
      amount: totals.total,
      currency: totals.currency,
    };
  }

  async capturePaypalOrder(dto: CapturePaypalOrderDto) {
    const existingOrder = await this.paymentRepo.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: dto.checkoutSessionId } },
      select: ['id', 'status', 'total', 'currency'],
    });
    if (existingOrder) return { order: existingOrder, payment: null };

    // Verify the PayPal order belongs to this checkout session before capturing
    const paypalOrder = await this.paypalService.getOrder(dto.paypalOrderId);
    if (!paypalOrder) {
      throw new BadRequestException('Could not retrieve PayPal order — please retry');
    }
    const orderRefId = paypalOrder.purchase_units?.[0]?.reference_id;
    if (orderRefId !== dto.checkoutSessionId) {
      throw new BadRequestException('PayPal order does not belong to this checkout session');
    }

    const session = await this.loadSessionOrFail(dto.checkoutSessionId);

    if (session.status === CheckoutSessionStatus.COMPLETED) {
      throw new BadRequestException('Checkout session already completed');
    }

    const capture = await this.paypalService.captureOrder(dto.paypalOrderId);

    if (capture.status !== 'COMPLETED') {
      throw new BadRequestException(`PayPal capture failed with status: ${capture.status}`);
    }

    const captureDetail = capture.purchase_units[0]?.payments?.captures?.[0];
    const totals = this.calculateTotals(session);

    return this.paymentRepo.manager.transaction(async (manager) => {
      const duplicate = await manager.findOne(OrderEntity, {
        where: { checkoutSession: { id: dto.checkoutSessionId } },
        select: ['id', 'status', 'total', 'currency'],
      });
      if (duplicate) return { order: duplicate, payment: null };

      const order = await this.createOrder(manager, session, totals);

      const payment = manager.create(PaymentEntity, {
        order,
        gateway: PaymentGateway.PAYPAL,
        gatewayTxnId: dto.paypalOrderId,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        gatewayResponse: capture as Record<string, any>,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      const paypalDetail = manager.create(PaypalDetailEntity, {
        payment,
        paypalOrderId: dto.paypalOrderId,
        payerEmail: capture.payer?.email_address ?? null,
        payerId: capture.payer?.payer_id ?? null,
        captureId: captureDetail?.id ?? null,
      });
      await manager.save(PaypalDetailEntity, paypalDetail);

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);

      return { order, payment };
    });
  }

  // Called by PayPal webhook PAYMENT.CAPTURE.COMPLETED — fallback if client never called capturePaypalOrder
  async fulfillPaypalWebhookCapture(
    paypalOrderId: string,
    checkoutSessionId: string,
    captureResource: Record<string, any>,
  ): Promise<void> {
    const existingOrder = await this.paymentRepo.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: checkoutSessionId } },
      select: ['id'],
    });
    if (existingOrder) return; // Already fulfilled by the client path — idempotent

    const session = await this.sessionRepo.findOne({
      where: { id: checkoutSessionId },
      relations: [
        'cart', 'cart.items', 'cart.items.variant', 'cart.items.variant.shape',
        'cart.items.variant.size', 'cart.items.variant.product',
        'cart.items.variant.product.images', 'user', 'guest',
      ],
      withDeleted: true,
    });
    if (!session) {
      // Session not found — PayPal charged the customer but we have no session.
      // MANUAL ACTION REQUIRED: refund via PayPal dashboard.
      throw new Error(`fulfillPaypalWebhookCapture: session ${checkoutSessionId} not found for PayPal order ${paypalOrderId} — MANUAL REFUND REQUIRED`);
    }
    // If session was already completed by another path, the idempotency check at the top handles it.
    // Only skip for truly terminal states (abandoned/expired) where we cannot fulfill.
    if (
      session.status === CheckoutSessionStatus.ABANDONED ||
      session.status === CheckoutSessionStatus.EXPIRED
    ) {
      throw new Error(`fulfillPaypalWebhookCapture: session ${checkoutSessionId} is ${session.status} — MANUAL REFUND REQUIRED`);
    }

    const totals = this.calculateTotals(session);

    await this.paymentRepo.manager.transaction(async (manager) => {
      const duplicate = await manager.findOne(OrderEntity, {
        where: { checkoutSession: { id: checkoutSessionId } },
        select: ['id'],
      });
      if (duplicate) return;

      const order = await this.createOrder(manager, session, totals);

      const payment = manager.create(PaymentEntity, {
        order,
        gateway: PaymentGateway.PAYPAL,
        gatewayTxnId: paypalOrderId,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        gatewayResponse: captureResource,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      const captureDetail = captureResource?.purchase_units?.[0]?.payments?.captures?.[0];
      const paypalDetail = manager.create(PaypalDetailEntity, {
        payment,
        paypalOrderId,
        payerEmail: captureResource?.payer?.email_address ?? null,
        payerId: captureResource?.payer?.payer_id ?? null,
        captureId: captureDetail?.id ?? null,
      });
      await manager.save(PaypalDetailEntity, paypalDetail);

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async loadSessionOrFail(id: string): Promise<CheckoutSessionEntity> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: [
        'cart',
        'cart.items',
        'cart.items.variant',
        'cart.items.variant.shape',
        'cart.items.variant.size',
        'cart.items.variant.product',
        'cart.items.variant.product.images',
        'user',
        'guest',
      ],
      withDeleted: true,
    });

    if (!session) throw new NotFoundException('Checkout session not found');

    if (
      session.status === CheckoutSessionStatus.ABANDONED ||
      session.status === CheckoutSessionStatus.EXPIRED
    ) {
      throw new BadRequestException('Checkout session is no longer active');
    }

    if (!session.contactSnapshot || !session.shippingSnapshot) {
      throw new BadRequestException('Checkout session is missing contact or shipping information');
    }

    if (new Date() > session.expiresAt) {
      throw new BadRequestException('Checkout session has expired');
    }

    return session;
  }

  private calculateTotals(session: CheckoutSessionEntity): SessionTotals {
    const items = session.cart?.items ?? [];
    const subtotalUSD = items.reduce(
      (sum, item) => sum + effectiveUnitPrice(item.variant) * item.quantity,
      0,
    );

    const shippingSnapshot = session.shippingSnapshot as Record<string, any>;
    const rawShippingFeeUSD = Number(shippingSnapshot?.shippingFee ?? 0);
    const discountAmountUSD = Number(session.discountAmount ?? 0);

    const currency = (session.currency as string) || 'USD';
    const exchangeRate = Number(session.exchangeRate) || 1;

    const isFreeShipping =
      rawShippingFeeUSD > 0 &&
      (subtotalUSD >= FREE_SHIPPING_THRESHOLD_USD ||
        session.couponDiscountType === DiscountType.FREE_SHIPPING);
    const effectiveShippingUSD = isFreeShipping ? 0 : rawShippingFeeUSD;

    const convert = (usd: number) =>
      currency === 'USD' ? usd : parseFloat((usd * exchangeRate).toFixed(2));

    return {
      subtotal: convert(subtotalUSD),
      discountAmount: convert(discountAmountUSD),
      shippingFee: convert(effectiveShippingUSD),
      total: Math.max(0, convert(subtotalUSD - discountAmountUSD + effectiveShippingUSD)),
      currency,
    };
  }

  private async createOrder(
    manager: EntityManager,
    session: CheckoutSessionEntity,
    totals: SessionTotals,
  ): Promise<OrderEntity> {
    const contactSnapshot = session.contactSnapshot as {
      fullName: string;
      email: string;
      phone: string;
    };
    const shippingSnapshot = session.shippingSnapshot as Record<string, any>;

    let couponEntity: CouponEntity | null = null;
    if (session.couponCode) {
      couponEntity = await manager.findOne(CouponEntity, {
        where: { code: session.couponCode },
      });
    }

    const order = manager.create(OrderEntity, {
      user: session.user ?? null,
      guest: session.guest ?? null,
      checkoutSession: session,
      coupon: couponEntity ?? null,
      couponCode: session.couponCode ?? null,
      couponDiscountType: couponEntity?.discountType ?? null,
      couponDiscountValue: couponEntity ? Number(couponEntity.discountValue) : null,
      status: OrderStatus.CONFIRMED,
      contactSnapshot: {
        fullName: contactSnapshot.fullName,
        email: contactSnapshot.email,
        phone: contactSnapshot.phone,
      },
      shippingSnapshot: {
        recipientName: shippingSnapshot.recipientName,
        street: shippingSnapshot.street,
        city: shippingSnapshot.city,
        country: shippingSnapshot.country,
        postalCode: shippingSnapshot.postalCode,
        shippingMethodName: shippingSnapshot.shippingMethodName,
      },
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      shippingFee: totals.shippingFee,
      total: totals.total,
      currency: totals.currency,
      exchangeRate: Number(session.exchangeRate) || null,
    });

    await manager.save(OrderEntity, order);

    // Order items are displayed/summed in `order.currency` (see admin
    // OrderDrawer), same as `totals.subtotal` above — so unitPrice needs the
    // identical USD→session-currency conversion `calculateTotals()` applied,
    // not the raw USD price.
    const itemExchangeRate = Number(session.exchangeRate) || 1;
    const toOrderCurrency = (usd: number) =>
      totals.currency === 'USD' ? usd : parseFloat((usd * itemExchangeRate).toFixed(2));

    const orderItems = (session.cart?.items ?? []).map((cartItem) =>
      manager.create(OrderItemEntity, {
        order,
        variant: cartItem.variant,
        quantity: cartItem.quantity,
        // Must match how `totals.subtotal` above was computed — the raw
        // `computedPrice` ignores an active sale, so a discounted product's
        // frozen order-item price silently didn't match what was actually
        // charged (order.subtotal/total do apply the sale ratio and currency
        // conversion; this needs both too).
        unitPrice: toOrderCurrency(effectiveUnitPrice(cartItem.variant)),
        shapeSurcharge: 0,
        itemDiscount: 0,
        shapeName: cartItem.variant.shape?.name ?? null,
        sizeLabel: cartItem.variant.size?.label ?? null,
        colorName: cartItem.variant.colorName ?? null,
        isCustomSize: cartItem.isCustomSize,
        productType: cartItem.variant.product?.type ?? null,
        productId: cartItem.variant.product?.id ?? null,
        productName: cartItem.variant.product?.name ?? null,
        productSlug: cartItem.variant.product?.slug ?? null,
        sku: cartItem.variant.sku ?? null,
        thumbnail:
          cartItem.variant.product?.images?.find((img) => img.isMain)?.url ??
          cartItem.variant.product?.images?.[0]?.url ??
          null,
      }),
    );

    await manager.save(OrderItemEntity, orderItems);

    for (const cartItem of session.cart?.items ?? []) {
      const result: { affectedRows: number } = await manager.query(
        `UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ? AND stock_qty >= ? AND deleted_at IS NULL`,
        [cartItem.quantity, cartItem.variant.id, cartItem.quantity],
      );
      if (result.affectedRows === 0) {
        throw new BadRequestException(
          `Insufficient stock for "${cartItem.variant.sku ?? cartItem.variant.id}"`,
        );
      }
    }

    const cartItemPairs = (session.cart?.items ?? []).map((cartItem, i) => ({
      cartItem,
      orderItem: orderItems[i],
    }));

    const customSizeRequests = cartItemPairs
      .map(({ cartItem, orderItem }) => {
        const measurements = cartItem.customMeasurements;
        if (!measurements) return null;
        const hasData =
          measurements['thumb'] ||
          measurements['index'] ||
          measurements['middle'] ||
          measurements['ring'] ||
          measurements['pinky'] ||
          measurements['notes'];
        if (!hasData) return null;
        return manager.create(CustomSizeRequestEntity, {
          orderItem,
          thumb: measurements['thumb'] ?? null,
          indexFinger: measurements['index'] ?? null,
          middleFinger: measurements['middle'] ?? null,
          ringFinger: measurements['ring'] ?? null,
          pinky: measurements['pinky'] ?? null,
          notes: measurements['notes'] ?? null,
        });
      })
      .filter((r): r is CustomSizeRequestEntity => r !== null);

    if (customSizeRequests.length > 0) {
      await manager.save(CustomSizeRequestEntity, customSizeRequests);
    }

    if (couponEntity) {
      await manager.increment(CouponEntity, { id: couponEntity.id }, 'usedCount', 1);

      const usage = manager.create(CouponUsageEntity, {
        coupon: couponEntity,
        user: session.user ?? null,
        order,
        discountApplied: totals.discountAmount,
      });
      await manager.save(CouponUsageEntity, usage);
    }

    return order;
  }
}
