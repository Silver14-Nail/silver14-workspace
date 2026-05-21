import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponRestrictionEntity } from '@/db/entities/coupons/coupon-restriction.entity';
import { CouponUserWhitelistEntity } from '@/db/entities/coupons/coupon-user-whitelist.entity';
import { CouponUsageEntity } from '@/db/entities/coupons/coupon-usage.entity';
import { UserEntity } from '@/db/entities/auths/user.entity';
import { PaginationDTO } from '@/common/dtos/pagination';

import { CouponListQueryDto } from './dto/coupon-list-query.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { AddRestrictionDto } from './dto/add-restriction.dto';
import { AddWhitelistUserDto } from './dto/add-whitelist-user.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,
    @InjectRepository(CouponRestrictionEntity)
    private readonly restrictionRepo: Repository<CouponRestrictionEntity>,
    @InjectRepository(CouponUserWhitelistEntity)
    private readonly whitelistRepo: Repository<CouponUserWhitelistEntity>,
    @InjectRepository(CouponUsageEntity)
    private readonly usageRepo: Repository<CouponUsageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async listCoupons(query: CouponListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortField = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.couponRepo.createQueryBuilder('coupon').skip(skip).take(limit);

    const sortColumn =
      sortField === 'usedCount'
        ? 'coupon.usedCount'
        : sortField === 'expiresAt'
          ? 'coupon.expiresAt'
          : sortField === 'discountValue'
            ? 'coupon.discountValue'
            : sortField === 'code'
              ? 'coupon.code'
              : 'coupon.createdAt';

    qb.orderBy(sortColumn, sortOrder);

    if (query.search) {
      qb.andWhere(
        '(LOWER(coupon.code) LIKE LOWER(:search) OR LOWER(coupon.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.isActive !== undefined) {
      qb.andWhere('coupon.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.discountType) {
      qb.andWhere('coupon.discountType = :discountType', { discountType: query.discountType });
    }

    if (query.isExpired === true) {
      qb.andWhere('coupon.expiresAt IS NOT NULL AND coupon.expiresAt < :now', { now: new Date() });
    } else if (query.isExpired === false) {
      qb.andWhere('(coupon.expiresAt IS NULL OR coupon.expiresAt >= :now)', { now: new Date() });
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

  async getStats() {
    const now = new Date();
    const thirtyDaysOut = new Date(now);
    thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

    const [
      totalCoupons,
      activeCoupons,
      inactiveCoupons,
      expiredCoupons,
      expiringSoon,
      totalUsages,
      totalDiscountResult,
    ] = await Promise.all([
      this.couponRepo.count(),
      this.couponRepo.count({ where: { isActive: true } }),
      this.couponRepo.count({ where: { isActive: false } }),
      this.couponRepo.count({ where: { expiresAt: LessThan(now) } }),
      this.couponRepo
        .createQueryBuilder('c')
        .where('c.expiresAt IS NOT NULL')
        .andWhere('c.expiresAt >= :now', { now })
        .andWhere('c.expiresAt <= :soon', { soon: thirtyDaysOut })
        .andWhere('c.isActive = :active', { active: true })
        .getCount(),
      this.usageRepo.count(),
      this.usageRepo
        .createQueryBuilder('u')
        .select('COALESCE(SUM(u.discountApplied), 0)', 'total')
        .getRawOne<{ total: string }>(),
    ]);

    return {
      totalCoupons,
      activeCoupons,
      inactiveCoupons,
      expiredCoupons,
      expiringSoon,
      totalUsages,
      totalDiscountGranted: parseFloat(totalDiscountResult?.total ?? '0'),
    };
  }

  async createCoupon(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.couponRepo.findOneBy({ code });
    if (existing) {
      throw new ConflictException(`Coupon code "${code}" already exists`);
    }

    const coupon = this.couponRepo.create({
      code,
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
      const code = dto.code.toUpperCase().trim();
      const existing = await this.couponRepo.findOneBy({ code });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Coupon code "${code}" already exists`);
      }
      coupon.code = code;
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

  async activateCoupon(id: string) {
    const coupon = await this.couponRepo.findOneBy({ id });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.isActive = true;
    return this.couponRepo.save(coupon);
  }

  async deactivateCoupon(id: string) {
    const coupon = await this.couponRepo.findOneBy({ id });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.isActive = false;
    return this.couponRepo.save(coupon);
  }

  async removeCoupon(id: string): Promise<void> {
    const coupon = await this.couponRepo.findOneBy({ id });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.couponRepo.softDelete(id);
  }

  // ─── Usages ─────────────────────────────────────────────────────────────────

  async listCouponUsages(couponId: string, page = 1, limit = 20) {
    const coupon = await this.couponRepo.findOneBy({ id: couponId });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.usageRepo.findAndCount({
      where: { coupon: { id: couponId } },
      relations: ['user', 'order'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items, pagination };
  }

  // ─── Restrictions ────────────────────────────────────────────────────────────

  async addRestriction(couponId: string, dto: AddRestrictionDto) {
    const coupon = await this.couponRepo.findOneBy({ id: couponId });
    if (!coupon) throw new NotFoundException('Coupon not found');

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

    if (!restriction) throw new NotFoundException('Restriction not found');

    await this.restrictionRepo.remove(restriction);
  }

  // ─── Whitelist ───────────────────────────────────────────────────────────────

  async addToWhitelist(couponId: string, dto: AddWhitelistUserDto) {
    const coupon = await this.couponRepo.findOneBy({ id: couponId });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.whitelistRepo.findOne({
      where: { coupon: { id: couponId }, user: { id: dto.userId } },
    });
    if (existing) throw new ConflictException('User is already in the whitelist');

    const entry = this.whitelistRepo.create({ coupon, user });
    return this.whitelistRepo.save(entry);
  }

  async removeFromWhitelist(couponId: string, whitelistId: string): Promise<void> {
    const entry = await this.whitelistRepo.findOne({
      where: { id: whitelistId, coupon: { id: couponId } },
    });
    if (!entry) throw new NotFoundException('Whitelist entry not found');
    await this.whitelistRepo.remove(entry);
  }
}
