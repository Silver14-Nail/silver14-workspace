import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { CheckoutSessionStatus, CheckoutStep } from '../../../common/enums/entity.enum';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { User } from '../auths/user.entity';
import { GuestCheckout } from './guest-checkout.entity';
import { Cart } from './cart.entity';

@Entity('checkout_sessions')
export class CheckoutSession extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Cart, (c) => c.checkoutSession, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => GuestCheckout, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guest_id' })
  guest: GuestCheckout | null;

  @Column({
    name: 'current_step',
    type: 'int',
    default: CheckoutStep.CONTACT,
  })
  currentStep: CheckoutStep;

  @Column({
    name: 'contact_snapshot',
    type: 'jsonb',
    nullable: true,
  })
  contactSnapshot: Record<string, any> | null;

  @Column({
    name: 'shipping_snapshot',
    type: 'jsonb',
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
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt: Date;
}
