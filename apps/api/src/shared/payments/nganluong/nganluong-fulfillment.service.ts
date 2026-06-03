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
import { NgLuongDetailEntity } from '@/db/entities/payments/nganluong-detail.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import {
  CheckoutSessionStatus,
  DiscountType,
  OrderStatus,
  PaymentGateway,
  PaymentStatus,
} from '@/common/enums/entity.enum';
import { effectiveUnitPrice } from '@/shared/pricing/pricing.utils';

import { NgLuongService } from './nganluong.service';
import type { NgLuongCallbackParams } from './types/nganluong.types';

const FREE_SHIPPING_THRESHOLD_USD = 100;

interface SessionTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
}

@Injectable()
export class NgLuongFulfillmentService {
  private readonly logger = new Logger(NgLuongFulfillmentService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(NgLuongDetailEntity)
    private readonly detailRepo: Repository<NgLuongDetailEntity>,
    private readonly ngLuongService: NgLuongService,
  ) {}

  // ─── Initiate Payment ────────────────────────────────────────────────────

  /**
   * Creates a Ngân Lượng order and returns the checkout_url for redirect.
   */
  async createPayment(
    checkoutSessionId: string,
    paymentMethod: string,
    bankCode: string,
    orderDescription?: string,
    vndRate?: number,
  ): Promise<{
    token: string;
    checkoutUrl: string;
    amountVnd: number;
  }> {
    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);

    // Convert to VND if needed
    const rate = vndRate ?? 0; // external rate, default 0
    const amountVnd =
      totals.currency === 'VND'
        ? Math.round(totals.total)
        : rate > 0
          ? Math.round(totals.total * rate)
          : Math.round(totals.total * 25000); // fallback USD→VND

    const nlAmount = this.ngLuongService.toNgLuongAmount(amountVnd);

    const contactSnapshot = session.contactSnapshot as {
      fullName: string;
      email: string;
      phone: string;
    };

    // Persist pending detail
    const detail = this.detailRepo.create({
      checkoutSessionId,
      orderCode: checkoutSessionId,
      amountVnd: nlAmount,
      paymentMethod,
      bankCode,
      status: 'pending',
    });
    await this.detailRepo.save(detail);

    const response = await this.ngLuongService.createOrder({
      orderCode: checkoutSessionId,
      totalAmount: nlAmount,
      paymentMethod,
      bankCode,
      orderDescription: orderDescription ?? `Order ${checkoutSessionId.slice(0, 8)}`,
      buyerFullname: contactSnapshot.fullName,
      buyerEmail: contactSnapshot.email,
      buyerMobile: contactSnapshot.phone,
      curCode: 'vnd',
      langCode: 'vi',
    });

    if (response.error_code !== '00') {
      await this.detailRepo.update(detail.id, {
        status: 'failed',
        checkoutResponse: response as unknown as Record<string, any>,
      });
      throw new BadRequestException(
        `Ngân Lượng error: ${response.description || response.error_code}`,
      );
    }

    // Update detail with token
    await this.detailRepo.update(detail.id, {
      nlToken: response.token,
      status: 'processing',
      checkoutResponse: response as unknown as Record<string, any>,
    });

    this.logger.log(
      `NgLuong order created — session ${checkoutSessionId}, token ${response.token}, ${nlAmount} VND`,
    );

    return {
      token: response.token,
      checkoutUrl: response.checkout_url,
      amountVnd: nlAmount,
    };
  }

  // ─── Handle Return/Notify Callback ───────────────────────────────────────

  /**
   * Processes the return_url or notify_url callback from Ngân Lượng.
   * Calls order check to verify, then creates the order if paid.
   */
  async fulfillFromCallback(params: NgLuongCallbackParams): Promise<{ orderId?: string }> {
    const { error_code, token, order_code } = params;

    if (!token) {
      this.logger.error('NgLuong callback: missing token');
      return {};
    }

    // Always verify via order check (notify_url has no signature verification)
    const checkResult = await this.ngLuongService.checkOrder(token);
    if (checkResult.error_code !== '00') {
      this.logger.warn(`NgLuong order check failed for token ${token}: ${checkResult.error_code}`);
      await this.detailRepo.update(
        { nlToken: token },
        {
          status: 'failed',
          orderCheckResponse: checkResult as unknown as Record<string, any>,
        },
      );
      return {};
    }

    const orderData = checkResult.data;

    // Update detail
    await this.detailRepo.update(
      { nlToken: token },
      {
        transactionId: String(orderData.transaction_id),
        paymentMethod: orderData.payment_method,
        bankCode: orderData.bank_code,
        orderCheckResponse: checkResult as unknown as Record<string, any>,
      },
    );

    if (!this.ngLuongService.isSuccessStatus(orderData.transaction_status)) {
      this.logger.log(
        `NgLuong order ${token} status: ${orderData.transaction_status} — not yet paid`,
      );
      await this.detailRepo.update({ nlToken: token }, { status: 'processing' });
      return {};
    }

    // Fulfill order
    const checkoutSessionId = orderData.order_code;
    return this.fulfillOrder(checkoutSessionId, token, orderData.total_amount);
  }

  // ─── Inquiry ─────────────────────────────────────────────────────────────

  async inquireAndUpdate(token: string): Promise<Record<string, any>> {
    const response = await this.ngLuongService.checkOrder(token);
    await this.detailRepo.update(
      { nlToken: token },
      {
        orderCheckResponse: response as unknown as Record<string, any>,
        ...(response.data?.transaction_status === '00' ? { status: 'succeeded' } : {}),
      },
    );
    return response as unknown as Record<string, any>;
  }

  // ─── Fulfill Order ───────────────────────────────────────────────────────

  private async fulfillOrder(
    checkoutSessionId: string,
    token: string,
    amountVnd: number,
  ): Promise<{ orderId?: string }> {
    // Idempotency guard
    const existingOrder = await this.dataSource.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: checkoutSessionId } },
      select: ['id'],
    });
    if (existingOrder) {
      this.logger.log(`NgLuong: order ${existingOrder.id} already exists — idempotent`);
      return { orderId: existingOrder.id };
    }

    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);

    let orderId: string | undefined;

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
        gateway: PaymentGateway.NGAN_LUONG,
        gatewayTxnId: token,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      await manager.update(
        NgLuongDetailEntity,
        { nlToken: token },
        {
          payment,
          status: 'succeeded',
        },
      );

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);
    });

    this.logger.log(`NgLuong: order ${orderId} fulfilled for session ${checkoutSessionId}`);
    return { orderId };
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
    const shippingSnapshot = session.shippingSnapshot as Record<string, unknown>;

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

    // Decrement stock
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
