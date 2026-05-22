import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { ShippingMethodEntity } from '@/db/entities/checkouts/shipping-method.entity';
import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponRestrictionEntity } from '@/db/entities/coupons/coupon-restriction.entity';
import { CouponUsageEntity } from '@/db/entities/coupons/coupon-usage.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import {
  CartStatus,
  CheckoutSessionStatus,
  CheckoutStep,
  CouponRestrictionType,
  DiscountType,
  OrderStatus,
  SupportedCurrency,
} from '@/common/enums/entity.enum';
import { CurrencyService } from '@/shared/currency/currency.service';

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
    @InjectRepository(CouponUsageEntity)
    private readonly couponUsageRepo: Repository<CouponUsageEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly currencyService: CurrencyService,
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

    if (userId && cart.user && (cart.user as any).id !== userId) {
      throw new ForbiddenException('Cart does not belong to this user');
    }

    const existing = await this.sessionRepo.findOne({
      where: { cart: { id: cart.id }, status: CheckoutSessionStatus.IN_PROGRESS },
    });
    if (existing) {
      existing.expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
      return this.sessionRepo.save(existing);
    }

    const requestedCurrency = this.currencyService.normalize(dto.currency ?? SupportedCurrency.USD);
    const rates = await this.currencyService.getRates();
    const exchangeRate = requestedCurrency === SupportedCurrency.EUR ? rates.USD_EUR : 1;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

    const session = this.sessionRepo.create({
      cart,
      user: userId ? ({ id: userId } as any) : null,
      currentStep: CheckoutStep.CONTACT,
      status: CheckoutSessionStatus.IN_PROGRESS,
      currency: requestedCurrency,
      exchangeRate,
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

    let method: ShippingMethodEntity | null = null;
    if (dto.shippingMethodId) {
      method = await this.shippingRepo.findOneBy({ id: dto.shippingMethodId, isActive: true });
      if (!method) throw new NotFoundException('Shipping method not found');
    }

    // Shipping fees are stored in USD; snapshot records the USD fee.
    // withTotals will convert to the session currency at display time.
    session.shippingSnapshot = {
      shippingMethodId: method?.id ?? null,
      shippingMethodName: method?.name ?? null,
      carrier: method?.carrier ?? null,
      shippingFee: method ? Number(method.fee) : 0,
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
      relations: ['restrictions', 'whitelist', 'whitelist.user'],
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

    if (coupon.whitelist.length > 0) {
      const userId = (session.user as any)?.id;
      if (!userId) {
        throw new BadRequestException(
          'This coupon is restricted to specific customers. Please log in to use it.',
        );
      }
      const inWhitelist = coupon.whitelist.some((w) => w.user?.id === userId);
      if (!inWhitelist) {
        throw new BadRequestException('You are not eligible for this coupon');
      }
    }

    const userId = (session.user as any)?.id;
    if (userId && coupon.maxUsesPerUser > 0) {
      const usageCount = await this.couponUsageRepo.count({
        where: { coupon: { id: coupon.id }, user: { id: userId } },
      });
      if (usageCount >= coupon.maxUsesPerUser) {
        throw new BadRequestException(
          'You have already used this coupon the maximum number of times',
        );
      }
    }

    // Coupon thresholds are always evaluated against the USD subtotal
    const subtotalUSD = await this.calculateSubtotalUSD(session);

    if (subtotalUSD < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount of $${Number(coupon.minOrderAmount).toFixed(2)} USD required for this coupon`,
      );
    }

    for (const restriction of coupon.restrictions) {
      await this.enforceRestriction(restriction, session);
    }

    const discountAmountUSD = this.computeDiscount(coupon, subtotalUSD);

    session.couponCode = coupon.code;
    session.discountAmount = discountAmountUSD;

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

  async getSessionOrder(
    sessionId: string,
  ): Promise<{ id: string; status: string; total: number; currency: string } | null> {
    const order = await this.orderRepo.findOne({
      where: { checkoutSession: { id: sessionId } },
      select: ['id', 'status', 'total', 'currency'],
    });
    return order
      ? { id: order.id, status: order.status, total: Number(order.total), currency: order.currency }
      : null;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async findActiveSession(sessionId: string): Promise<CheckoutSessionEntity> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, status: CheckoutSessionStatus.IN_PROGRESS },
      relations: [
        'cart',
        'cart.items',
        'cart.items.variant',
        'cart.items.variant.product',
        'cart.items.variant.shape',
        'user',
      ],
    });

    if (!session) throw new NotFoundException('Active checkout session not found');

    if (session.expiresAt < new Date()) {
      session.status = CheckoutSessionStatus.EXPIRED;
      await this.sessionRepo.save(session);
      throw new UnprocessableEntityException('Checkout session has expired');
    }

    return session;
  }

  private async enforceRestriction(
    restriction: CouponRestrictionEntity,
    session: CheckoutSessionEntity,
  ): Promise<void> {
    const items = session.cart?.items ?? [];

    switch (restriction.restrictionType) {
      case CouponRestrictionType.NEW_USER: {
        const userId = (session.user as any)?.id;
        if (userId) {
          const pastOrders = await this.orderRepo.count({
            where: { user: { id: userId }, status: Not(OrderStatus.CANCELLED) },
          });
          if (pastOrders > 0) {
            throw new BadRequestException('This coupon is for new customers only');
          }
        }
        break;
      }

      case CouponRestrictionType.MIN_QTY: {
        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
        const minQty = restriction.refId ? parseInt(restriction.refId, 10) : 1;
        if (isNaN(minQty) || totalQty < minQty) {
          throw new BadRequestException(
            `This coupon requires a minimum of ${minQty} item${minQty !== 1 ? 's' : ''} in your cart`,
          );
        }
        break;
      }

      case CouponRestrictionType.PRODUCT: {
        if (!restriction.refId) break;
        const hasProduct = items.some(
          (item) => (item.variant as any).product?.id === restriction.refId,
        );
        if (!hasProduct) {
          throw new BadRequestException(
            `This coupon requires "${restriction.refLabel ?? 'a specific product'}" to be in your cart`,
          );
        }
        break;
      }

      case CouponRestrictionType.SHAPE: {
        if (!restriction.refId) break;
        const hasShape = items.some(
          (item) => (item.variant as any).shape?.id === restriction.refId,
        );
        if (!hasShape) {
          throw new BadRequestException(
            `This coupon requires "${restriction.refLabel ?? 'a specific nail shape'}" products in your cart`,
          );
        }
        break;
      }

      case CouponRestrictionType.CATEGORY:
        break;
    }
  }

  private async calculateSubtotalUSD(session: CheckoutSessionEntity): Promise<number> {
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

  private computeDiscount(coupon: CouponEntity, subtotalUSD: number): number {
    if (coupon.discountType === DiscountType.PERCENT) {
      const discount = (subtotalUSD * Number(coupon.discountValue)) / 100;
      return coupon.maxDiscountAmount !== null
        ? Math.min(discount, Number(coupon.maxDiscountAmount))
        : discount;
    }
    if (coupon.discountType === DiscountType.FIXED) {
      return Math.min(Number(coupon.discountValue), subtotalUSD);
    }
    // FREE_SHIPPING — shipping waiver handled at payment time
    return 0;
  }

  private withTotals(session: CheckoutSessionEntity) {
    const items = session.cart?.items ?? [];

    // All DB amounts are in USD
    const subtotalUSD = items.reduce(
      (sum, item) => sum + Number(item.variant?.computedPrice ?? 0) * item.quantity,
      0,
    );
    const shippingFeeUSD = session.shippingSnapshot
      ? Number(session.shippingSnapshot['shippingFee'] ?? 0)
      : null;
    const discountAmountUSD = Number(session.discountAmount ?? 0);

    const isFreeShipping =
      session.couponCode !== null && session.discountAmount === 0 && shippingFeeUSD !== null;
    const effectiveShippingUSD = isFreeShipping ? 0 : (shippingFeeUSD ?? 0);

    const currency = (session.currency as string) || SupportedCurrency.USD;
    const rate = Number(session.exchangeRate) || 1;

    const convert = (usd: number) =>
      currency === SupportedCurrency.USD ? usd : parseFloat((usd * rate).toFixed(2));

    return {
      ...session,
      totals: {
        subtotal: convert(subtotalUSD),
        discountAmount: convert(discountAmountUSD),
        shippingFee: shippingFeeUSD !== null ? convert(effectiveShippingUSD) : null,
        total:
          shippingFeeUSD !== null
            ? convert(subtotalUSD - discountAmountUSD + effectiveShippingUSD)
            : null,
        currency,
        exchangeRate: rate,
      },
    };
  }
}
