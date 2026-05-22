import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { CheckoutSessionStatus, CheckoutStep } from '../../../common/enums/entity.enum';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { UserEntity } from '../auths/user.entity';
import { GuestCheckoutEntity } from './guest-checkout.entity';
import { CartEntity } from './cart.entity';

@Entity('checkout_sessions')
export class CheckoutSessionEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => CartEntity, (c) => c.checkoutSession, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @ManyToOne(() => GuestCheckoutEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guest_id' })
  guest: GuestCheckoutEntity | null;

  @Column({
    name: 'current_step',
    type: 'int',
    default: CheckoutStep.CONTACT,
  })
  currentStep: CheckoutStep;

  @Column({
    name: 'contact_snapshot',
    type: 'json',
    nullable: true,
  })
  contactSnapshot: Record<string, any> | null;

  @Column({
    name: 'shipping_snapshot',
    type: 'json',
    nullable: true,
  })
  shippingSnapshot: Record<string, any> | null;

  @Column({
    name: 'coupon_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  couponCode: string | null;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({
    type: 'enum',
    enum: CheckoutSessionStatus,
    default: CheckoutSessionStatus.IN_PROGRESS,
  })
  status: CheckoutSessionStatus;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
  })
  currency: string;

  @Column({
    name: 'exchange_rate',
    type: 'numeric',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  exchangeRate: number | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;
}
