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
import { TwocheckoutDetailEntity } from '@/db/entities/payments/twocheckout-detail.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import {
  CheckoutSessionStatus,
  DiscountType,
  OrderStatus,
  PaymentGateway,
  PaymentStatus,
} from '@/common/enums/entity.enum';
import { effectiveUnitPrice } from '@/shared/pricing/pricing.utils';

import { TwocheckoutService } from './twocheckout.service';

const FREE_SHIPPING_THRESHOLD_USD = 100;

interface SessionTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
}

@Injectable()
export class TwocheckoutFulfillmentService {
  private readonly logger = new Logger(TwocheckoutFulfillmentService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(TwocheckoutDetailEntity)
    private readonly detailRepo: Repository<TwocheckoutDetailEntity>,
    private readonly twocheckoutService: TwocheckoutService,
  ) {}

  // ─── Create Checkout ───────────────────────────────────────────────────────

  /**
   * Creates a 2Checkout hosted-checkout order and returns the redirect URL.
   * The frontend redirects the customer to this URL to complete payment.
   */
  async createCheckout(
    checkoutSessionId: string,
    returnUrl: string,
    cancelUrl: string,
    customerIp: string,
  ): Promise<{ paymentUrl: string; refNo: string | null; amount: number; currency: string }> {
    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);
    const { total: amount, currency } = totals;

    const contact = session.contactSnapshot as {
      fullName: string;
      email: string;
      phone?: string;
    };
    const shipping = session.shippingSnapshot as Record<string, string>;

    const nameParts = (contact.fullName ?? '').trim().split(' ');
    const firstName = nameParts[0] ?? 'Customer';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Persist a pending detail record
    const detail = this.detailRepo.create({
      checkoutSessionId,
      amountCents: Math.round(amount * 100),
      currency,
      status: 'pending',
      merchantOrderRef: checkoutSessionId,
    });
    await this.detailRepo.save(detail);

    const orderResp = await this.twocheckoutService.createOrder({
      currency,
      country: shipping.country ?? 'US',
      customerIp,
      merchantOrderRef: checkoutSessionId,
      items: [
        {
          name: `Silver14 Nail Order`,
          description: `Order ref: ${checkoutSessionId}`,
          quantity: 1,
          price: parseFloat(amount.toFixed(2)),
        },
      ],
      billing: {
        FirstName: firstName,
        LastName: lastName,
        Email: contact.email,
        Country: shipping.country ?? 'US',
        Phone: contact.phone,
        Address1: shipping.street,
        City: shipping.city,
        Zip: shipping.postalCode,
      },
      returnUrl,
      cancelUrl,
    });

    const paymentUrl =
      orderResp.PaymentDetails?.PaymentMethod?.RedirectURL ??
      orderResp.PaymentDetails?.PaymentMethod?.Authorize3DS ??
      '';

    await this.detailRepo.update(detail.id, {
      refNo: orderResp.RefNo ?? null,
      paymentUrl: paymentUrl || null,
      gatewayResponse: orderResp as unknown as Record<string, any>,
    });

    this.logger.log(
      `2Checkout order created — session ${checkoutSessionId}, RefNo=${orderResp.RefNo}, ${amount} ${currency}`,
    );

    return { paymentUrl, refNo: orderResp.RefNo ?? null, amount, currency };
  }

  // ─── IPN Fulfillment ──────────────────────────────────────────────────────

  /**
   * Processes a verified 2Checkout IPN notification.
   * Called by the webhook controller after signature verification.
   */
  async fulfillFromIpn(payload: Record<string, string | string[]>): Promise<void> {
    const refNo = payload['REFNO'] as string;
    const merchantOrderRef = payload['REFNOEXT'] as string;
    const orderStatus = (payload['ORDERSTATUS'] as string)?.toUpperCase();
    const payMethod = payload['PAYMETHOD_CODE'] as string | undefined;

    this.logger.log(
      `2Checkout IPN: RefNo=${refNo}, ref=${merchantOrderRef}, status=${orderStatus}`,
    );

    if (!merchantOrderRef) {
      this.logger.error('2Checkout IPN: missing REFNOEXT (merchant order ref)');
      return;
    }

    if (orderStatus !== 'PURCHASE') {
      this.logger.debug(`2Checkout IPN: ignoring status "${orderStatus}" for ref=${merchantOrderRef}`);
      // Update detail status for non-purchase events
      await this.detailRepo.update(
        { merchantOrderRef },
        { status: orderStatus === 'REFUND' ? 'refunded' : 'failed', ipnPayload: payload as any },
      );
      return;
    }

    // Idempotency guard
    const existingOrder = await this.dataSource.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: merchantOrderRef } },
      select: ['id'],
    });
    if (existingOrder) {
      this.logger.log(
        `2Checkout: order ${existingOrder.id} already exists for session ${merchantOrderRef} — idempotent`,
      );
      return;
    }

    const detail = await this.detailRepo.findOne({ where: { merchantOrderRef } });
    if (!detail) {
      this.logger.error(
        `2Checkout IPN: no detail record for merchantOrderRef=${merchantOrderRef}`,
      );
      return;
    }

    const session = await this.loadAndValidateSession(merchantOrderRef);
    const totals = this.calculateTotals(session);

    await this.dataSource.transaction(async (manager) => {
      const duplicate = await manager.findOne(OrderEntity, {
        where: { checkoutSession: { id: merchantOrderRef } },
        select: ['id'],
      });
      if (duplicate) return;

      const order = await this.createOrder(manager, session, totals);

      const payment = manager.create(PaymentEntity, {
        order,
        gateway: PaymentGateway.TWOCHECKOUT,
        gatewayTxnId: refNo,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        gatewayResponse: payload as unknown as Record<string, any>,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      await manager.update(TwocheckoutDetailEntity, detail.id, {
        payment,
        refNo,
        status: 'paid',
        payMethod: payMethod ?? null,
        ipnPayload: payload as any,
      });

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);
    });

    this.logger.log(`2Checkout: order fulfilled for session ${merchantOrderRef}, RefNo=${refNo}`);
  }

  // ─── Session Loading & Validation ──────────────────────────────────────────

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

    if (!session) throw new NotFoundException(`Checkout session "${checkoutSessionId}" not found`);

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

  // ─── Totals ────────────────────────────────────────────────────────────────

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

  // ─── Order Creation ────────────────────────────────────────────────────────

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
      couponEntity = await manager.findOne(CouponEntity, { where: { code: session.couponCode } });
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
