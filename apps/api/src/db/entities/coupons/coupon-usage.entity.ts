import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { UserEntity } from '../auths/user.entity';
import { OrderEntity } from '../orders/order.entity';
import { CouponEntity } from './coupon.entity';

@Entity('coupon_usages')
export class CouponUsageEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CouponEntity, (c) => c.usages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @ManyToOne(() => OrderEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({
    name: 'discount_applied',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  discountApplied: number;
}
