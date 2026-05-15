import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { User } from '../auths/user.entity';
import { WholesaleEnquiry } from './wholesale-enquiry.entity';
import { WholesaleTier } from './wholesale-tier.entity';
import { WholesaleProductPricing } from './wholesale-product-pricing.entity';
import { WholesaleOrder } from './wholesale-order.entity';

@Entity('wholesale_accounts')
export class WholesaleAccount extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => WholesaleEnquiry, (e) => e.account, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'enquiry_id' })
  enquiry: WholesaleEnquiry;

  @ManyToOne(() => WholesaleTier, (t) => t.accounts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tier_id' })
  tier: WholesaleTier;

  @Column({
    name: 'business_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  businessName: string | null;

  @Column({
    type: 'varchar',
    length: 100,
  })
  country: string;

  @Column({
    name: 'credit_limit',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  creditLimit: number;

  @Column({
    name: 'current_balance',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentBalance: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'approved_at',
    type: 'timestamptz',
    nullable: true,
  })
  approvedAt: Date | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User | null;

  @OneToMany(() => WholesaleProductPricing, (p) => p.account)
  productPricings: WholesaleProductPricing[];

  @OneToMany(() => WholesaleOrder, (o) => o.account)
  orders: WholesaleOrder[];
}
