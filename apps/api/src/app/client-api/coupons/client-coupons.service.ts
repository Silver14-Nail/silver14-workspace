import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { DiscountType } from '@/common/enums/entity.enum';

import { ValidateCouponDto } from './dto/validate-coupon.dto';

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  discountPreview?: number;
  savingsLabel?: string;
  message: string;
}

@Injectable()
export class ClientCouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
  ) {}

  async validateCoupon(dto: ValidateCouponDto): Promise<CouponValidationResult> {
    const now = new Date();

    const coupon = await this.couponRepo.findOneBy({ code: dto.code, isActive: true });

    if (!coupon) {
      return { valid: false, message: 'Coupon not found or inactive' };
    }
    if (coupon.startsAt && coupon.startsAt > now) {
      return { valid: false, message: 'Coupon is not yet valid' };
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { valid: false, message: 'Coupon has expired' };
    }
    if (coupon.maxUsesTotal !== null && coupon.usedCount >= coupon.maxUsesTotal) {
      return { valid: false, message: 'Coupon usage limit has been reached' };
    }

    const cart = await this.cartRepo.findOne({
      where: { id: dto.cartId },
      relations: ['items', 'items.variant'],
    });

    if (!cart || !cart.items?.length) {
      return { valid: false, message: 'Cart not found or is empty' };
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.computedPrice) * item.quantity,
      0,
    );

    if (subtotal < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        message: `Minimum order of $${Number(coupon.minOrderAmount).toFixed(2)} USD required`,
      };
    }

    let discountPreview: number;
    let savingsLabel: string;

    if (coupon.discountType === DiscountType.PERCENT) {
      const raw = (subtotal * Number(coupon.discountValue)) / 100;
      discountPreview =
        coupon.maxDiscountAmount !== null ? Math.min(raw, Number(coupon.maxDiscountAmount)) : raw;
      savingsLabel = `Save $${discountPreview.toFixed(2)}`;
    } else if (coupon.discountType === DiscountType.FIXED) {
      discountPreview = Math.min(Number(coupon.discountValue), subtotal);
      savingsLabel = `Save $${discountPreview.toFixed(2)}`;
    } else {
      // FREE_SHIPPING
      discountPreview = 0;
      savingsLabel = 'Free shipping applied';
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountPreview,
      savingsLabel,
      message: `${savingsLabel} with code ${coupon.code}`,
    };
  }
}
