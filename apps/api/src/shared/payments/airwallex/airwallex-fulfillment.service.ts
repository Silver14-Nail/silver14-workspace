import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { EntityManager, DeepPartial } from 'typeorm';

import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponUsageEntity } from '@/db/entities/coupons/coupon-usage.entity';
import { CustomSizeRequestEntity } from '@/db/entities/orders/custom-size-request.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { OrderItemEntity } from '@/db/entities/orders/order-item.entity';
import { AirwallexDetailEntity } from '@/db/entities/payments/airwallex-detail.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import {
  CheckoutSessionStatus,
  DiscountType,
  OrderStatus,
  PaymentGateway,
  PaymentStatus,
} from '@/common/enums/entity.enum';
import { effectiveUnitPrice } from '@/shared/pricing/pricing.utils';

import { AirwallexService } from './airwallex.service';
import type { AirwallexPaymentIntent, AirwallexCheckoutSession } from './types/airwallex.types';

const FREE_SHIPPING_THRESHOLD_USD = 100;

interface SessionTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
}

@Injectable()
export class AirwallexFulfillmentService {
  private readonly logger = new Logger(AirwallexFulfillmentService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(AirwallexDetailEntity)
    private readonly detailRepo: Repository<AirwallexDetailEntity>,
    private readonly airwallexService: AirwallexService,
  ) {}

  // ─── Payment Intent ────────────────────────────────────────────────────────

  /**
   * Creates an Airwallex Payment Intent for direct Elements integration.
   * The client secret is returned so the frontend can mount Airwallex Elements.
   */
  async createPaymentIntent(
    checkoutSessionId: string,
    amountOverride?: number,
    paymentMethodTypes?: string[],
    customerId?: string,
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  }> {
    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);
    const amount = amountOverride ?? totals.total;
    const currency = totals.currency;

    // Persist a pending detail record so webhook can resolve intent → session
    const detail = this.detailRepo.create({
      checkoutSessionId,
      amountCents: Math.round(amount * 100), // Airwallex uses cents
      currency,
      status: 'pending',
      paymentMethodTypes: paymentMethodTypes ?? null,
      customerId: customerId ?? null,
      allowSaveCard: false,
    });
    await this.detailRepo.save(detail);

    const pmTypes = paymentMethodTypes ?? ['card'];
    const intent = await this.airwallexService.createPaymentIntent({
      amount: Math.round(amount * 100),
      currency,
      merchantOrderId: checkoutSessionId,
      paymentMethodOptions: {
        type: pmTypes,
      },
      metadata: {
        checkoutSessionId,
        detailId: detail.id,
      },
    });

    // Update detail with Airwallex IDs
    await this.detailRepo.update(detail.id, {
      paymentIntentId: intent.id,
      clientSecret: intent.clientSecret,
      status: intent.status as AirwallexDetailEntity['status'],
    });

    this.logger.log(
      `Airwallex Payment Intent ${intent.id} created — session ${checkoutSessionId}, ${amount} ${currency}`,
    );

    return {
      clientSecret: intent.clientSecret,
      paymentIntentId: intent.id,
      amount,
      currency,
    };
  }

  // ─── Checkout Session ──────────────────────────────────────────────────────

  /**
   * Creates a hosted Airwallex Checkout Session.
   * The frontend redirects the customer to the returned URL.
   */
  async createCheckoutSession(
    checkoutSessionId: string,
    returnUrl: string,
    cancelUrl?: string,
    amountOverride?: number,
    paymentMethodTypes?: string[],
    allowSaveCard?: boolean,
    customerId?: string,
    customer?: {
      merchantCustomerId?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    },
  ): Promise<{
    checkoutSessionRef: string;
    url: string;
    clientSecret: string;
    amount: number;
    currency: string;
  }> {
    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);
    const amount = amountOverride ?? totals.total;
    const currency = totals.currency;

    // Persist a pending detail record
    const detail = this.detailRepo.create({
      checkoutSessionId,
      amountCents: Math.round(amount * 100),
      currency,
      status: 'pending',
      paymentMethodTypes: paymentMethodTypes ?? null,
      customerId: customerId ?? null,
      allowSaveCard: allowSaveCard ?? false,
    });
    await this.detailRepo.save(detail);

    const pmTypes = paymentMethodTypes ?? ['card'];
    const awxSession = await this.airwallexService.createCheckoutSession({
      amount: Math.round(amount * 100),
      currency,
      merchantOrderId: checkoutSessionId,
      returnUrl,
      cancelUrl,
      paymentMethodOptions: {
        type: pmTypes,
        card: {
          allowSaveCard: allowSaveCard ?? false,
        },
      },
      customerId,
      customer,
      metadata: {
        checkoutSessionId,
        detailId: detail.id,
      },
    });

    // Update detail
    await this.detailRepo.update(detail.id, {
      checkoutSessionRef: awxSession.id,
      clientSecret: awxSession.clientSecret,
      status: 'pending',
    });

    this.logger.log(
      `Airwallex Checkout Session ${awxSession.id} created — session ${checkoutSessionId}, ${amount} ${currency}`,
    );

    return {
      checkoutSessionRef: awxSession.id,
      url: awxSession.url,
      clientSecret: awxSession.clientSecret,
      amount,
      currency,
    };
  }

  // ─── Webhook Fulfillment ───────────────────────────────────────────────────

  /**
   * Processes an Airwallex webhook event for payment_intent.succeeded.
   * Also handles payment_intent.payment_failed, etc.
   */
  async fulfillFromWebhook(eventType: string, data: Record<string, any>): Promise<void> {
    this.logger.log(`Airwallex webhook received: ${eventType}`);

    switch (eventType) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(data);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(data);
        break;
      case 'payment_intent.cancelled':
        await this.handlePaymentIntentCancelled(data);
        break;
      case 'checkout_session.completed':
        await this.handleCheckoutSessionCompleted(data);
        break;
      default:
        this.logger.debug(`Unhandled Airwallex webhook event type: ${eventType}`);
    }
  }

  private async handlePaymentIntentSucceeded(data: Record<string, any>): Promise<void> {
    const intent = data as AirwallexPaymentIntent;
    const checkoutSessionId = intent.metadata?.checkoutSessionId;
    const detailId = intent.metadata?.detailId;

    if (!checkoutSessionId || !detailId) {
      this.logger.error(
        `Airwallex webhook: Payment Intent ${intent.id} missing metadata — MANUAL ACTION REQUIRED`,
      );
      return;
    }

    // Idempotency guard
    const existingOrder = await this.dataSource.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: checkoutSessionId } },
      select: ['id'],
    });
    if (existingOrder) {
      this.logger.log(
        `Airwallex: order ${existingOrder.id} already exists for session ${checkoutSessionId} — idempotent`,
      );
      return;
    }

    const detail = await this.detailRepo.findOne({
      where: { id: detailId, checkoutSessionId },
    });
    if (!detail) {
      this.logger.error(
        `Airwallex webhook: detail record ${detailId} not found for session ${checkoutSessionId}`,
      );
      return;
    }

    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);

    // Extract card info from the payment method if available
    const paymentMethod = intent.paymentMethodId
      ? await this.airwallexService.inquireResource('payment_intent', intent.id).catch(() => null)
      : null;

    // The payment method details are in a nested field
    const paymentMethodDetails = (paymentMethod as any)?.payment_method as
      | Record<string, any>
      | undefined;
    const cardInfo = paymentMethodDetails?.card as Record<string, any> | undefined;

    await this.dataSource.transaction(async (manager) => {
      // Double-check inside transaction
      const duplicate = await manager.findOne(OrderEntity, {
        where: { checkoutSession: { id: checkoutSessionId } },
        select: ['id'],
      });
      if (duplicate) return;

      const order = await this.createOrder(manager, session, totals);

      const payment = manager.create(PaymentEntity, {
        order,
        gateway: PaymentGateway.AIRWALLEX,
        gatewayTxnId: intent.id,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        gatewayResponse: intent as unknown as Record<string, any>,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      // Update detail
      await manager.update(AirwallexDetailEntity, detail.id, {
        payment,
        paymentIntentId: intent.id,
        status: 'succeeded',
        cardBrand: cardInfo?.brand ?? null,
        cardLast4: cardInfo?.last4 ?? null,
        paymentMethodId: intent.paymentMethodId,
        clientSecret: intent.clientSecret,
        webhookPayload: data,
      });

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);
    });

    this.logger.log(
      `Airwallex: order fulfilled for session ${checkoutSessionId}, intent ${intent.id}`,
    );
  }

  private async handlePaymentIntentFailed(data: Record<string, any>): Promise<void> {
    const intent = data as AirwallexPaymentIntent;
    const detailId = intent.metadata?.detailId;
    if (detailId) {
      await this.detailRepo.update(detailId, {
        status: 'failed',
        webhookPayload: data,
      });
    }
    this.logger.warn(`Airwallex: Payment Intent ${intent.id} failed`);
  }

  private async handlePaymentIntentCancelled(data: Record<string, any>): Promise<void> {
    const intent = data as AirwallexPaymentIntent;
    const detailId = intent.metadata?.detailId;
    if (detailId) {
      await this.detailRepo.update(detailId, {
        status: 'cancelled',
        webhookPayload: data,
      });
    }
    this.logger.warn(`Airwallex: Payment Intent ${intent.id} cancelled`);
  }

  private async handleCheckoutSessionCompleted(data: Record<string, any>): Promise<void> {
    const sessionRef = data as AirwallexCheckoutSession;
    // For hosted checkout sessions, the payment intent is created internally.
    // The payment_intent.succeeded webhook will handle fulfillment.
    // Here we just update the detail status if needed.
    const detailId = sessionRef.metadata?.detailId;
    if (detailId) {
      await this.detailRepo.update(detailId, {
        checkoutSessionRef: sessionRef.id,
        paymentIntentId: sessionRef.paymentIntentId,
        status: 'processing',
      });
    }
    this.logger.log(`Airwallex: Checkout Session ${sessionRef.id} completed`);
  }

  // ─── Client Confirm (after SDK payment) ────────────────────────────────────

  /**
   * Called by the frontend after Airwallex Elements confirms the payment.
   * Verifies the payment intent status with Airwallex, then creates the order.
   *
   * This is the client-side confirmation path (analogous to Stripe's
   * `confirmStripePayment`). Idempotent — safe to call multiple times.
   */
  async fulfillFromClientConfirm(
    paymentIntentId: string,
    checkoutSessionId: string,
  ): Promise<{ orderId: string }> {
    // Verify payment status with Airwallex first
    const intent = await this.airwallexService.retrievePaymentIntent(paymentIntentId);

    if (intent.status !== 'succeeded') {
      throw new BadRequestException(
        `Airwallex Payment Intent ${paymentIntentId} has status "${intent.status}" — order cannot be created`,
      );
    }

    // Verify the payment intent belongs to this checkout session
    if (intent.merchantOrderId !== checkoutSessionId) {
      throw new BadRequestException(
        'Airwallex Payment Intent does not belong to this checkout session',
      );
    }

    // Idempotency guard
    const existingOrder = await this.dataSource.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: checkoutSessionId } },
      select: ['id'],
    });
    if (existingOrder) {
      this.logger.log(
        `Airwallex: order ${existingOrder.id} already exists for session ${checkoutSessionId} — idempotent`,
      );
      return { orderId: existingOrder.id };
    }

    // Find the detail record by payment intent ID
    const detail = await this.detailRepo.findOne({
      where: { paymentIntentId, checkoutSessionId },
    });

    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);

    let orderId!: string;

    await this.dataSource.transaction(async (manager) => {
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
        gateway: PaymentGateway.AIRWALLEX,
        gatewayTxnId: intent.id,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        gatewayResponse: intent as unknown as Record<string, any>,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      if (detail) {
        await manager.update(AirwallexDetailEntity, detail.id, {
          payment,
          paymentIntentId: intent.id,
          paymentMethodId: intent.paymentMethodId,
          status: 'succeeded',
          clientSecret: intent.clientSecret,
          cardBrand: detail.cardBrand,
          cardLast4: detail.cardLast4,
        });
      }

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);
    });

    this.logger.log(
      `Airwallex: order ${orderId} created via client confirm for session ${checkoutSessionId}`,
    );

    return { orderId };
  }

  // ─── Inquiry ────────────────────────────────────────────────────────────────

  async inquireAndUpdate(
    resourceType: 'payment_intent' | 'refund' | 'checkout_session',
    resourceId: string,
  ) {
    const response = await this.airwallexService.inquireResource(resourceType, resourceId);

    if (resourceType === 'payment_intent') {
      await this.detailRepo.update({ paymentIntentId: resourceId }, { gatewayResponse: response });
    }

    return response;
  }

  // ─── Session Loading & Validation ───────────────────────────────────────────

  private async loadAndValidateSession(checkoutSessionId: string): Promise<CheckoutSessionEntity> {
    const session = await this.dataSource.manager.findOne(CheckoutSessionEntity, {
      where: { id: checkoutSessionId },
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
    });

    if (!session) {
      throw new NotFoundException(`Checkout session "${checkoutSessionId}" not found`);
    }

    if (
      session.status === CheckoutSessionStatus.ABANDONED ||
      session.status === CheckoutSessionStatus.EXPIRED
    ) {
      throw new BadRequestException(
        `Checkout session is no longer active (status: ${session.status})`,
      );
    }

    if (!session.contactSnapshot || !session.shippingSnapshot) {
      throw new BadRequestException('Checkout session is missing contact or shipping information');
    }

    if (new Date() > session.expiresAt) {
      throw new BadRequestException('Checkout session has expired');
    }

    return session;
  }

  // ─── Totals ─────────────────────────────────────────────────────────────────

  private calculateTotals(session: CheckoutSessionEntity): SessionTotals {
    const items = session.cart?.items ?? [];
    const subtotalUSD = items.reduce(
      (sum, item) => sum + effectiveUnitPrice(item.variant) * item.quantity,
      0,
    );

    const shippingSnapshot = session.shippingSnapshot as Record<string, unknown>;
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

  // ─── Order Creation ─────────────────────────────────────────────────────────

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
    const shippingSnapshot = session.shippingSnapshot as Record<string, string>;

    let couponEntity: CouponEntity | null = null;
    if (session.couponCode) {
      couponEntity = await manager.findOne(CouponEntity, {
        where: { code: session.couponCode },
      });
    }

    const orderData: DeepPartial<OrderEntity> = {
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
    };
    const order = manager.create(OrderEntity, orderData);
    await manager.save(OrderEntity, order);

    const orderItems = (session.cart?.items ?? []).map((cartItem) =>
      manager.create(OrderItemEntity, {
        order,
        variant: cartItem.variant,
        quantity: cartItem.quantity,
        unitPrice: cartItem.variant.computedPrice,
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

    // Decrement stock atomically
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

    // Custom size requests
    const customSizeRequests = (session.cart?.items ?? [])
      .map((cartItem, i) => {
        const m = cartItem.customMeasurements;
        if (!m) return null;
        const hasData =
          m['thumb'] || m['index'] || m['middle'] || m['ring'] || m['pinky'] || m['notes'];
        if (!hasData) return null;
        return manager.create(CustomSizeRequestEntity, {
          orderItem: orderItems[i],
          thumb: m['thumb'] ?? null,
          indexFinger: m['index'] ?? null,
          middleFinger: m['middle'] ?? null,
          ringFinger: m['ring'] ?? null,
          pinky: m['pinky'] ?? null,
          notes: m['notes'] ?? null,
        });
      })
      .filter((r): r is CustomSizeRequestEntity => r !== null);

    if (customSizeRequests.length > 0) {
      await manager.save(CustomSizeRequestEntity, customSizeRequests);
    }

    // Coupon usage
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
