import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponRestrictionEntity } from '@/db/entities/coupons/coupon-restriction.entity';
import { PaginationDTO } from '@/common/dtos/pagination';

import { CouponListQueryDto } from './dto/coupon-list-query.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { AddRestrictionDto } from './dto/add-restriction.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,
    @InjectRepository(CouponRestrictionEntity)
    private readonly restrictionRepo: Repository<CouponRestrictionEntity>,
  ) {}

  async listCoupons(query: CouponListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.couponRepo
      .createQueryBuilder('coupon')
      .skip(skip)
      .take(limit)
      .orderBy('coupon.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere('LOWER(coupon.code) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('coupon.isActive = :isActive', { isActive: query.isActive });
    }

    const [items, totalItems] = await qb.getManyAndCount();

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items, pagination };
  }

  async getCoupon(id: string) {
    const coupon = await this.couponRepo.findOne({
      where: { id },
      relations: [
        'restrictions',
        'whitelist',
        'whitelist.user',
        'usages',
        'usages.user',
        'usages.order',
      ],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async createCoupon(dto: CreateCouponDto) {
    const existing = await this.couponRepo.findOneBy({ code: dto.code });
    if (existing) {
      throw new ConflictException(`Coupon code "${dto.code}" already exists`);
    }

    const coupon = this.couponRepo.create({
      code: dto.code.toUpperCase(),
      description: dto.description ?? null,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxDiscountAmount: dto.maxDiscountAmount ?? null,
      minOrderAmount: dto.minOrderAmount ?? 0,
      maxUsesTotal: dto.maxUsesTotal ?? null,
      maxUsesPerUser: dto.maxUsesPerUser ?? 1,
      isActive: dto.isActive ?? true,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    return this.couponRepo.save(coupon);
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const coupon = await this.couponRepo.findOneBy({ id });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (dto.code !== undefined) {
      const existing = await this.couponRepo.findOneBy({ code: dto.code.toUpperCase() });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Coupon code "${dto.code}" already exists`);
      }
      coupon.code = dto.code.toUpperCase();
    }

    if (dto.description !== undefined) coupon.description = dto.description;
    if (dto.discountType !== undefined) coupon.discountType = dto.discountType;
    if (dto.discountValue !== undefined) coupon.discountValue = dto.discountValue;
    if (dto.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = dto.maxDiscountAmount;
    if (dto.minOrderAmount !== undefined) coupon.minOrderAmount = dto.minOrderAmount;
    if (dto.maxUsesTotal !== undefined) coupon.maxUsesTotal = dto.maxUsesTotal;
    if (dto.maxUsesPerUser !== undefined) coupon.maxUsesPerUser = dto.maxUsesPerUser;
    if (dto.isActive !== undefined) coupon.isActive = dto.isActive;
    if (dto.startsAt !== undefined) coupon.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.expiresAt !== undefined)
      coupon.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    return this.couponRepo.save(coupon);
  }

  async removeCoupon(id: string): Promise<void> {
    const coupon = await this.couponRepo.findOneBy({ id });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.couponRepo.softDelete(id);
  }

  // ─── Restrictions ────────────────────────────────────────────────────────────

  async addRestriction(couponId: string, dto: AddRestrictionDto) {
    const coupon = await this.couponRepo.findOneBy({ id: couponId });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const restriction = this.restrictionRepo.create({
      coupon,
      restrictionType: dto.restrictionType,
      refId: dto.refId ?? null,
      refLabel: dto.refLabel ?? null,
    });

    return this.restrictionRepo.save(restriction);
  }

  async removeRestriction(couponId: string, restrictionId: string): Promise<void> {
    const restriction = await this.restrictionRepo.findOne({
      where: { id: restrictionId, coupon: { id: couponId } },
    });

    if (!restriction) {
      throw new NotFoundException('Restriction not found');
    }

    await this.restrictionRepo.remove(restriction);
  }
}
