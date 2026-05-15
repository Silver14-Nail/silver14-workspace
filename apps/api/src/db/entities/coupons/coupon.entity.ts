import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DiscountType } from '../../../common/enums/entity.enum';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { CouponRestriction } from './coupon-restriction.entity';
import { CouponUserWhitelist } from './coupon-user-whitelist.entity';
import { CouponUsage } from './coupon-usage.entity';

@Entity('coupons')
export class Coupon extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @Column({
    name: 'discount_value',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  discountValue: number;

  @Column({
    name: 'max_discount_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxDiscountAmount: number | null;

  @Column({
    name: 'min_order_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  minOrderAmount: number;

  @Column({
    name: 'max_uses_total',
    type: 'int',
    nullable: true,
  })
  maxUsesTotal: number | null;

  @Column({
    name: 'max_uses_per_user',
    type: 'int',
    default: 1,
  })
  maxUsesPerUser: number;

  @Column({
    name: 'used_count',
    type: 'int',
    default: 0,
  })
  usedCount: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'starts_at',
    type: 'timestamp',
    nullable: true,
  })
  startsAt: Date | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date | null;

  @OneToMany(() => CouponRestriction, (r) => r.coupon)
  restrictions: CouponRestriction[];

  @OneToMany(() => CouponUserWhitelist, (w) => w.coupon)
  whitelist: CouponUserWhitelist[];

  @OneToMany(() => CouponUsage, (u) => u.coupon)
  usages: CouponUsage[];
}
