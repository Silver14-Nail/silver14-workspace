import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { User } from '../auths/user.entity';
import { Coupon } from './coupon.entity';

@Entity('coupon_user_whitelists')
export class CouponUserWhitelist extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, (c) => c.whitelist, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
