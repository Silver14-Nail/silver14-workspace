import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { OrderStatus } from '../../../common/enums/entity.enum';
import { SoftDeleteAbstractEntity } from '../../../common/entities';
import { User } from '../auths/user.entity';
import { GuestCheckout } from '../checkouts/guest-checkout.entity';
import { CheckoutSession } from '../checkouts/checkout-session.entity';
import { ShippingMethod } from '../checkouts/shipping-method.entity';
import { Coupon } from '../coupons/coupon.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => CheckoutSession, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'checkout_session_id' })
  checkoutSession: CheckoutSession | null;

  @ManyToOne(() => ShippingMethod, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod: ShippingMethod | null;

  @ManyToOne(() => Coupon, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

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

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
