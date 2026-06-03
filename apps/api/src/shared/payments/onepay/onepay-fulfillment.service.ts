import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { DeepPartial, EntityManager } from 'typeorm';
import { DataSource, Repository } from 'typeorm';

import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponUsageEntity } from '@/db/entities/coupons/coupon-usage.entity';
import { CustomSizeRequestEntity } from '@/db/entities/orders/custom-size-request.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { OrderItemEntity } from '@/db/entities/orders/order-item.entity';
import { OnepayDetailEntity } from '@/db/entities/payments/onepay-detail.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import {
  CheckoutSessionStatus,
  DiscountType,
  OrderStatus,
  PaymentGateway,
  PaymentStatus,
} from '@/common/enums/entity.enum';
import { effectiveUnitPrice } from '@/shared/pricing/pricing.utils';

import { OnepayService } from './onepay.service';
import type { OnepayReturnParams } from './types/onepay.types';
import { ONEPAY_PENDING_CODES } from './types/onepay.types';

const FREE_SHIPPING_THRESHOLD_USD = 100;

interface SessionTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
}

@Injectable()
export class OnepayFulfillmentService {
  private readonly logger = new Logger(OnepayFulfillmentService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(OnepayDetailEntity)
    private readonly detailRepo: Repository<OnepayDetailEntity>,
    private readonly onepayService: OnepayService,
  ) {}

  // ─── Initiate Payment ────────────────────────────────────────────────────

  /**
   * Builds the OnePAY redirect URL for the given checkout session.
   *
   * Steps:
   *  1. Load & validate checkout session
   *  2. Calculate totals → convert to VND → multiply by 100 for OnePAY
   *  3. Persist a pending OnepayDetailEntity
   *  4. Build signed redirect URL
   */
  async createPayment(
    checkoutSessionId: string,
    clientIp: string,
    cardList?: string,
    vndRate?: number,
    locale?: 'en' | 'vn',
    currencyOverride?: string,
  ): Promise<{
    redirectUrl: string;
    merchTxnRef: string;
    amountOnepay: number;
  }> {
    const session = await this.loadAndValidateSession(checkoutSessionId);
    const totals = this.calculateTotals(session);

    // Domestic ATM / QR only support VND — convert if session currency differs.
    // International cards support multi-currency (USD, EUR, etc.).
    // currencyOverride from frontend takes precedence over session currency.
    const sessionCurrency = (currencyOverride ?? totals.currency).toUpperCase();
    const isDomesticOnly = cardList === 'DOMESTIC' || cardList === 'QR';
    const paymentCurrency = isDomesticOnly ? 'VND' : sessionCurrency;

    let paymentAmount: number;
    if (paymentCurrency === 'VND' && sessionCurrency !== 'VND') {
      // Need to convert from session currency → VND
      const rate = vndRate ?? 27_000;
      paymentAmount = totals.total * rate;
    } else {
      paymentAmount = totals.total;
    }

    const amountOnepay = this.onepayService.toOnepayAmount(paymentAmount);
    const merchTxnRef = this.onepayService.buildMerchTxnRef(checkoutSessionId);

    const contactSnapshot = session.contactSnapshot as {
      fullName?: string;
      email?: string;
      phone?: string;
    };

    // Persist pending record
    const detail = this.detailRepo.create({
      checkoutSessionId,
      merchTxnRef,
      amountOnepay,
      cardList: cardList ?? null,
      status: 'pending',
    });
    await this.detailRepo.save(detail);

    // Build redirect URL
    const redirectUrl = this.onepayService.buildRedirectUrl({
      vpc_MerchTxnRef: merchTxnRef,
      vpc_OrderInfo: checkoutSessionId.slice(0, 8),
      vpc_Amount: String(amountOnepay),
      vpc_TicketNo: clientIp,
      vpc_CardList: cardList,
      vpc_Customer_Phone: contactSnapshot.phone,
      vpc_Customer_Email: contactSnapshot.email,
      vpc_Customer_Id: session.user?.id ?? undefined,
      locale,
      vpc_Currency: paymentCurrency,
    });

    // Mark as processing
    await this.detailRepo.update(detail.id, { status: 'processing' });

    this.logger.log(
      `OnePAY payment initiated — session ${checkoutSessionId}, ref ${merchTxnRef}, ${amountOnepay} (${paymentCurrency}×100)`,
    );

    return { redirectUrl, merchTxnRef, amountOnepay };
  }

  // ─── Handle Return / IPN ─────────────────────────────────────────────────

  /**
   * Processes return URL or IPN callback from OnePAY.
   *
   * Verification per spec §4:
   *  1. Check hash validity
   *  2. Check vpc_TxnResponseCode === "0"
   *  3. Optionally QueryDR to double-verify (on hash fail or pending)
   */
  async fulfillFromCallback(params: OnepayReturnParams): Promise<{
    success: boolean;
    orderId?: string;
    pending?: boolean;
    error?: string;
  }> {
    const { vpc_MerchTxnRef, vpc_TxnResponseCode, vpc_TransactionNo } = params;

    if (!vpc_MerchTxnRef) {
      this.logger.error('OnePAY callback: missing vpc_MerchTxnRef');
      return { success: false, error: 'missing_txn_ref' };
    }

    // Always verify hash first
    const hashValid = this.onepayService.verifyHash(params);
    if (!hashValid) {
      this.logger.warn(
        `OnePAY callback hash mismatch for ref ${vpc_MerchTxnRef} — running QueryDR`,
      );
      return this.recoverViaQueryDr(vpc_MerchTxnRef);
    }

    // Save raw callback
    await this.detailRepo.update(
      { merchTxnRef: vpc_MerchTxnRef },
      {
        txnResponseCode: vpc_TxnResponseCode ?? null,
        transactionNo: vpc_TransactionNo ?? null,
        vpcCard: params.vpc_Card ?? null,
        payChannel: params.vpc_PayChannel ?? null,
        cardNum: params.vpc_CardNum ?? null,
        callbackPayload: params as unknown as Record<string, any>,
      },
    );

    // Pending?
    if (vpc_TxnResponseCode && ONEPAY_PENDING_CODES.has(vpc_TxnResponseCode)) {
      this.logger.log(`OnePAY ref ${vpc_MerchTxnRef} still pending (code ${vpc_TxnResponseCode})`);
      await this.detailRepo.update({ merchTxnRef: vpc_MerchTxnRef }, { status: 'processing' });
      return { success: false, pending: true };
    }

    if (!this.onepayService.isSuccess(vpc_TxnResponseCode)) {
      this.logger.warn(`OnePAY ref ${vpc_MerchTxnRef} failed — code ${vpc_TxnResponseCode}`);
      await this.detailRepo.update({ merchTxnRef: vpc_MerchTxnRef }, { status: 'failed' });
      return { success: false, error: vpc_TxnResponseCode ?? 'unknown' };
    }

    // Success — fulfill order
    const detail = await this.detailRepo.findOne({ where: { merchTxnRef: vpc_MerchTxnRef } });
    if (!detail) {
      this.logger.error(`OnePAY: no detail record for ref ${vpc_MerchTxnRef}`);
      return { success: false, error: 'record_not_found' };
    }

    const result = await this.fulfillOrder(
      detail.checkoutSessionId,
      vpc_MerchTxnRef,
      vpc_TransactionNo ?? '',
      detail.amountOnepay,
    );

    return { success: true, orderId: result.orderId };
  }

  // ─── QueryDR Inquiry ─────────────────────────────────────────────────────

  async inquireAndUpdate(merchTxnRef: string): Promise<Record<string, any>> {
    const response = await this.onepayService.queryDr(merchTxnRef);

    const update: Partial<OnepayDetailEntity> = {
      queryDrResponse: response as unknown as Record<string, any>,
      txnResponseCode: response.vpc_TxnResponseCode ?? null,
      transactionNo: response.vpc_TransactionNo ?? null,
    };

    if (this.onepayService.isSuccess(response.vpc_TxnResponseCode)) {
      update.status = 'succeeded';
    } else if (ONEPAY_PENDING_CODES.has(response.vpc_TxnResponseCode ?? '')) {
      update.status = 'processing';
    } else if (response.vpc_DRExists === 'N') {
      update.status = 'failed';
    }

    await this.detailRepo.update({ merchTxnRef }, update);
    return response as unknown as Record<string, any>;
  }

  // ─── Private: recover via QueryDR ────────────────────────────────────────

  private async recoverViaQueryDr(
    merchTxnRef: string,
  ): Promise<{ success: boolean; orderId?: string; pending?: boolean; error?: string }> {
    try {
      const dr = await this.onepayService.queryDr(merchTxnRef);
      await this.detailRepo.update(
        { merchTxnRef },
        {
          queryDrResponse: dr as unknown as Record<string, any>,
          txnResponseCode: dr.vpc_TxnResponseCode ?? null,
        },
      );

      if (!this.onepayService.isSuccess(dr.vpc_TxnResponseCode)) {
        if (ONEPAY_PENDING_CODES.has(dr.vpc_TxnResponseCode ?? '')) {
          return { success: false, pending: true };
        }
        await this.detailRepo.update({ merchTxnRef }, { status: 'failed' });
        return { success: false, error: dr.vpc_TxnResponseCode ?? 'unknown' };
      }

      const detail = await this.detailRepo.findOne({ where: { merchTxnRef } });
      if (!detail) return { success: false, error: 'record_not_found' };

      const result = await this.fulfillOrder(
        detail.checkoutSessionId,
        merchTxnRef,
        dr.vpc_TransactionNo ?? '',
        detail.amountOnepay,
      );
      return { success: true, orderId: result.orderId };
    } catch (err: unknown) {
      this.logger.error(
        `OnePAY QueryDR error for ${merchTxnRef}: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      return { success: false, error: 'query_dr_failed' };
    }
  }

  // ─── Private: Fulfill Order ──────────────────────────────────────────────

  private async fulfillOrder(
    checkoutSessionId: string,
    merchTxnRef: string,
    transactionNo: string,
    amountOnepay: number,
  ): Promise<{ orderId?: string }> {
    console.log('amountOnepay', amountOnepay);

    // Idempotency guard
    const existingOrder = await this.dataSource.manager.findOne(OrderEntity, {
      where: { checkoutSession: { id: checkoutSessionId } },
      select: ['id'],
    });
    if (existingOrder) {
      this.logger.log(`OnePAY: order ${existingOrder.id} already exists — idempotent`);
      await this.detailRepo.update({ merchTxnRef }, { status: 'succeeded' });
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
        gateway: PaymentGateway.ONEPAY,
        gatewayTxnId: transactionNo || merchTxnRef,
        status: PaymentStatus.PAID,
        amount: totals.total,
        currency: totals.currency,
        paidAt: new Date(),
      });
      await manager.save(PaymentEntity, payment);

      await manager.update(
        OnepayDetailEntity,
        { merchTxnRef },
        {
          payment,
          status: 'succeeded',
          transactionNo: transactionNo || null,
        },
      );

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);
    });

    this.logger.log(`OnePAY: order ${orderId} fulfilled for session ${checkoutSessionId}`);
    return { orderId };
  }

  // ─── Session Loading & Validation ────────────────────────────────────────

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

  // ─── Totals ──────────────────────────────────────────────────────────────

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

  // ─── Order Creation ──────────────────────────────────────────────────────

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
        recipientName: (shippingSnapshot.recipientName as string) ?? null,
        street: (shippingSnapshot.street as string) ?? null,
        city: (shippingSnapshot.city as string) ?? null,
        country: (shippingSnapshot.country as string) ?? null,
        postalCode: (shippingSnapshot.postalCode as string) ?? null,
        shippingMethodName: (shippingSnapshot.shippingMethodName as string) ?? null,
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
