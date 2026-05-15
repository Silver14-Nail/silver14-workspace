import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { WholesaleTierName } from '../../../common/enums/entity.enum';
import { AbstractEntity } from '../../../common/entities';

import { WholesaleAccount } from './wholesale-account.entity';

@Entity('wholesale_tiers')
export class WholesaleTier extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WholesaleTierName,
    unique: true,
  })
  name: WholesaleTierName;

  @Column({
    name: 'min_monthly_qty',
    type: 'int',
    default: 0,
  })
  minMonthlyQty: number;

  @Column({
    name: 'discount_percent',
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  discountPercent: number;

  @Column({
    name: 'max_discount_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxDiscountAmount: number | null;

  @Column({
    name: 'free_shipping',
    type: 'boolean',
    default: false,
  })
  freeShipping: boolean;

  @Column({
    name: 'min_order_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  minOrderAmount: number;

  @OneToMany(() => WholesaleAccount, (a) => a.tier)
  accounts: WholesaleAccount[];
}
