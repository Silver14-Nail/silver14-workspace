import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { ShippingMethodEntity } from '@/db/entities/checkouts/shipping-method.entity';
import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import {
  CartStatus,
  CheckoutSessionStatus,
  CheckoutStep,
  DiscountType,
} from '@/common/enums/entity.enum';

import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

const SESSION_EXPIRY_HOURS = 2;

@Injectable()
export class ClientCheckoutService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CheckoutSessionEntity)
    private readonly sessionRepo: Repository<CheckoutSessionEntity>,
    @InjectRepository(ShippingMethodEntity)
    private readonly shippingRepo: Repository<ShippingMethodEntity>,
    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,
  ) {}

  // ─── Shipping Methods ─────────────────────────────────────────────────────────

  listShippingMethods() {
    return this.shippingRepo.find({ where: { isActive: true } });
  }

  // ─── Session ──────────────────────────────────────────────────────────────────

  async createSession(dto: CreateCheckoutSessionDto, userId?: string) {
    const cart = await this.cartRepo.findOne({
      where: { id: dto.cartId, status: CartStatus.ACTIVE },
      relations: ['items'],
    });

    if (!cart) throw new NotFoundException('Active cart not found');
    if (!cart.items?.length) throw new BadRequestException('Cart is empty');

    // If user is authenticated, ensure the cart belongs to them
    if (userId && cart.user && (cart.user as any).id !== userId) {
      throw new ForbiddenException('Cart does not belong to this user');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

    const session = this.sessionRepo.create({
      cart,
      user: userId ? ({ id: userId } as any) : null,
      currentStep: CheckoutStep.CONTACT,
      status: CheckoutSessionStatus.IN_PROGRESS,
      contactSnapshot: null,
      shippingSnapshot: null,
      couponCode: null,
      discountAmount: 0,
      expiresAt,
    });

    return this.sessionRepo.save(session);
  }

  async getSession(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['cart', 'cart.items', 'cart.items.variant', 'cart.items.variant.product'],
    });

    if (!session) throw new NotFoundException('Checkout session not found');
    return this.withTotals(session);
  }

  async updateContact(sessionId: string, dto: UpdateContactDto) {
    const session = await this.findActiveSession(sessionId);

    session.contactSnapshot = {
      email: dto.email,
      phone: dto.phone,
      fullName: dto.fullName,
    };

    if (session.currentStep === CheckoutStep.CONTACT) {
      session.currentStep = CheckoutStep.SHIPPING;
    }

    return this.sessionRepo.save(session);
  }

  async updateShipping(sessionId: string, dto: UpdateShippingDto) {
    const session = await this.findActiveSession(sessionId);

    if (!session.contactSnapshot) {
      throw new UnprocessableEntityException(
        'Contact info must be saved before selecting shipping',
      );
    }

    const method = await this.shippingRepo.findOneBy({ id: dto.shippingMethodId, isActive: true });
    if (!method) throw new NotFoundException('Shipping method not found');

    session.shippingSnapshot = {
      shippingMethodId: method.id,
      shippingMethodName: method.name,
      carrier: method.carrier,
      shippingFee: Number(method.fee),
      currency: method.currency,
      recipientName: dto.recipientName,
      street: dto.street,
      city: dto.city,
      country: dto.country,
      postalCode: dto.postalCode ?? null,
    };

    if (session.currentStep === CheckoutStep.SHIPPING) {
      session.currentStep = CheckoutStep.PAYMENT;
    }

    return this.sessionRepo.save(session);
  }

  async applyCoupon(sessionId: string, dto: ApplyCouponDto) {
    const session = await this.findActiveSession(sessionId);

    const now = new Date();
    const coupon = await this.couponRepo.findOne({
      where: { code: dto.code, isActive: true },
    });

    if (!coupon) throw new NotFoundException('Coupon not found or inactive');
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('Coupon has expired');
    }
    if (coupon.maxUsesTotal !== null && coupon.usedCount >= coupon.maxUsesTotal) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const subtotal = await this.calculateSubtotal(session);

    if (subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
      );
    }

    const discountAmount = this.computeDiscount(coupon, subtotal);

    session.couponCode = coupon.code;
    session.discountAmount = discountAmount;

    const saved = await this.sessionRepo.save(session);
    return this.withTotals(saved);
  }

  async removeCoupon(sessionId: string) {
    const session = await this.findActiveSession(sessionId);

    session.couponCode = null;
    session.discountAmount = 0;

    const saved = await this.sessionRepo.save(session);
    return this.withTotals(saved);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async findActiveSession(sessionId: string): Promise<CheckoutSessionEntity> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, status: CheckoutSessionStatus.IN_PROGRESS },
      relations: ['cart', 'cart.items', 'cart.items.variant'],
    });

    if (!session) throw new NotFoundException('Active checkout session not found');

    if (session.expiresAt < new Date()) {
      session.status = CheckoutSessionStatus.EXPIRED;
      await this.sessionRepo.save(session);
      throw new UnprocessableEntityException('Checkout session has expired');
    }

    return session;
  }

  private async calculateSubtotal(session: CheckoutSessionEntity): Promise<number> {
    const cart = await this.cartRepo.findOne({
      where: { id: session.cart.id },
      relations: ['items', 'items.variant'],
    });

    return (
      cart?.items.reduce(
        (sum, item) => sum + Number(item.variant.computedPrice) * item.quantity,
        0,
      ) ?? 0
    );
  }

  private computeDiscount(coupon: CouponEntity, subtotal: number): number {
    if (coupon.discountType === DiscountType.PERCENT) {
      const discount = (subtotal * Number(coupon.discountValue)) / 100;
      return coupon.maxDiscountAmount !== null
        ? Math.min(discount, Number(coupon.maxDiscountAmount))
        : discount;
    }

    if (coupon.discountType === DiscountType.FIXED) {
      return Math.min(Number(coupon.discountValue), subtotal);
    }

    // FREE_SHIPPING — actual fee waiver is handled at payment time via shippingSnapshot
    return 0;
  }

  private withTotals(session: CheckoutSessionEntity) {
    const items = session.cart?.items ?? [];
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.variant?.computedPrice ?? 0) * item.quantity,
      0,
    );
    const shippingFee = session.shippingSnapshot
      ? Number(session.shippingSnapshot['shippingFee'] ?? 0)
      : null;
    const discountAmount = Number(session.discountAmount ?? 0);

    const isFreeShipping =
      session.couponCode !== null && session.discountAmount === 0 && shippingFee !== null;

    const effectiveShipping = isFreeShipping ? 0 : (shippingFee ?? 0);
    const total = shippingFee !== null ? subtotal - discountAmount + effectiveShipping : null;

    return {
      ...session,
      totals: {
        subtotal,
        discountAmount,
        shippingFee,
        total,
        currency: session.shippingSnapshot?.['currency'] ?? 'EUR',
      },
    };
  }
}
