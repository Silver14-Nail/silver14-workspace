import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';

import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { OrderItemEntity } from '@/db/entities/orders/order-item.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { PaypalDetailEntity } from '@/db/entities/payments/paypal-detail.entity';
import { CardDetailEntity } from '@/db/entities/payments/card-detail.entity';
import {
  CardBrand,
  CardProcessor,
  CheckoutSessionStatus,
  OrderStatus,
  PaymentGateway,
  PaymentStatus,
} from '@/common/enums/entity.enum';
import { StripeService } from '@/shared/payments/stripe.service';
import { PaypalService } from '@/shared/payments/paypal.service';

import { InitiateStripePaymentDto } from './dto/initiate-stripe-payment.dto';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from './dto/capture-paypal-order.dto';

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

  // Called by Stripe webhook after payment_intent.succeeded
  async fulfillStripePayment(paymentIntentId: string, checkoutSessionId: string): Promise<void> {
    const session = await this.loadSessionOrFail(checkoutSessionId);

    if (session.status === CheckoutSessionStatus.COMPLETED) return; // idempotent

    const intent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    // payment_method is expanded via retrievePaymentIntent({ expand: ['payment_method'] })
    const pm = intent.payment_method as unknown as ExpandedPaymentMethod | null;

    const totals = this.calculateTotals(session);

    await this.paymentRepo.manager.transaction(async (manager) => {
      const order = await this.createOrder(manager, session, totals);

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
        payerEmail: null,
        payerId: null,
        captureId: captureDetail?.id ?? null,
      });
      await manager.save(PaypalDetailEntity, paypalDetail);

      session.status = CheckoutSessionStatus.COMPLETED;
      await manager.save(CheckoutSessionEntity, session);

      return { order, payment };
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
        'user',
        'guest',
      ],
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
    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.variant.computedPrice) * item.quantity;
    }, 0);

    const shippingSnapshot = session.shippingSnapshot as Record<string, any>;
    const shippingFee = Number(shippingSnapshot?.shippingFee ?? 0);
    const discountAmount = Number(session.discountAmount ?? 0);
    const currency = (shippingSnapshot?.currency as string) || 'EUR';

    return {
      subtotal,
      discountAmount,
      shippingFee,
      total: Math.max(0, subtotal - discountAmount + shippingFee),
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

    const order = manager.create(OrderEntity, {
      user: session.user ?? null,
      guest: session.guest ?? null,
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
    });

    await manager.save(OrderEntity, order);

    const orderItems = (session.cart?.items ?? []).map((cartItem) =>
      manager.create(OrderItemEntity, {
        order,
        variant: cartItem.variant,
        quantity: cartItem.quantity,
        unitPrice: cartItem.variant.computedPrice,
        shapeSurcharge: 0,
        itemDiscount: 0,
        shapeName: cartItem.variant.shape?.name ?? '',
        sizeLabel: cartItem.variant.size?.label ?? '',
        isCustomSize: cartItem.isCustomSize,
      }),
    );

    await manager.save(OrderItemEntity, orderItems);

    return order;
  }
}
