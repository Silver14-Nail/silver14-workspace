import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { OrderStatus } from '../../../common/enums/entity.enum';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { UserEntity } from '../auths/user.entity';
import { GuestCheckoutEntity } from '../checkouts/guest-checkout.entity';
import { CheckoutSessionEntity } from '../checkouts/checkout-session.entity';
import { ShippingMethodEntity } from '../checkouts/shipping-method.entity';
import { CouponEntity } from '../coupons/coupon.entity';
import { OrderItemEntity } from './order-item.entity';
import { PaymentEntity } from '../payments/payment.entity';

@Entity('orders')
export class OrderEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => CheckoutSessionEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'checkout_session_id' })
  checkoutSession: CheckoutSessionEntity | null;

  @ManyToOne(() => ShippingMethodEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod: ShippingMethodEntity | null;

  @ManyToOne(() => CouponEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  trackingNumber: string | null;

  @Column({
    name: 'contact_snapshot',
    type: 'json',
  })
  contactSnapshot: {
    email: string;
    phone: string;
    fullName: string;
  };

  @Column({
    name: 'shipping_snapshot',
    type: 'json',
  })
  shippingSnapshot: {
    recipientName: string;
    street: string;
    city: string;
    country: string;
    postalCode?: string;
    shippingMethodName: string;
  };

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  subtotal: number;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({
    name: 'shipping_fee',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shippingFee: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  total: number;

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
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  carrier: string | null;

  @Column({
    name: 'coupon_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  couponCode: string | null;

  @Column({
    name: 'coupon_discount_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  couponDiscountType: string | null;

  @Column({
    name: 'coupon_discount_value',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  couponDiscountValue: number | null;

  @Column({
    name: 'internal_notes',
    type: 'text',
    nullable: true,
  })
  internalNotes: string | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items: OrderItemEntity[];

  @OneToOne(() => PaymentEntity, (p) => p.order)
  payment: PaymentEntity;
}
