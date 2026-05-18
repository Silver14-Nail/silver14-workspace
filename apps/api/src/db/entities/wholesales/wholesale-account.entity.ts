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

import { UserEntity } from '../auths/user.entity';
import { WholesaleEnquiryEntity } from './wholesale-enquiry.entity';
import { WholesaleTierEntity } from './wholesale-tier.entity';
import { WholesaleProductPricingEntity } from './wholesale-product-pricing.entity';
import { WholesaleOrderEntity } from './wholesale-order.entity';

@Entity('wholesale_accounts')
export class WholesaleAccountEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToOne(() => WholesaleEnquiryEntity, (e) => e.account, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'enquiry_id' })
  enquiry: WholesaleEnquiryEntity;

  @ManyToOne(() => WholesaleTierEntity, (t) => t.accounts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tier_id' })
  tier: WholesaleTierEntity;

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
    type: 'timestamp',
    nullable: true,
  })
  approvedAt: Date | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: UserEntity | null;

  @OneToMany(() => WholesaleProductPricingEntity, (p) => p.account)
  productPricings: WholesaleProductPricingEntity[];

  @OneToMany(() => WholesaleOrderEntity, (o) => o.account)
  orders: WholesaleOrderEntity[];
}
