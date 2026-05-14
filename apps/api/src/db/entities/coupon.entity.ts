import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { CouponRestrictionType, DiscountType } from '@/common/enums/entity.enum';
import { User } from './auth.entity';
import { Order } from './order.entity';
import { AbstractEntity, SoftDeleteAbstractEntity } from '@/common/entities';

@Entity('coupons')
export class Coupon extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  @Column({ name: 'discount_value', type: 'numeric', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: 'max_discount_amount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column({ name: 'min_order_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  minOrderAmount: number;

  @Column({ name: 'max_uses_total', nullable: true })
  maxUsesTotal: number | null;

  @Column({ name: 'max_uses_per_user', default: 1 })
  maxUsesPerUser: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @OneToMany(() => CouponRestriction, (r) => r.coupon)
  restrictions: CouponRestriction[];

  @OneToMany(() => CouponUserWhitelist, (w) => w.coupon)
  whitelist: CouponUserWhitelist[];

  @OneToMany(() => CouponUsage, (u) => u.coupon)
  usages: CouponUsage[];
}
@Entity('coupon_restrictions')
export class CouponRestriction extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, (c) => c.restrictions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Column({ name: 'restriction_type', type: 'enum', enum: CouponRestrictionType })
  restrictionType: CouponRestrictionType;

  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId: string | null;

  @Column({ name: 'ref_label', length: 200, nullable: true })
  refLabel: string | null;
}

@Entity('coupon_user_whitelists')
@Index(['coupon', 'user'], { unique: true })
export class CouponUserWhitelist extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, (c) => c.whitelist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('coupon_usages')
export class CouponUsage extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, (c) => c.usages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'discount_applied', type: 'numeric', precision: 10, scale: 2 })
  discountApplied: number;
}
