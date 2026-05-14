import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderStatus } from '@/common/enums/entity.enum';
import { User } from './auth.entity';
import { GuestCheckout, CheckoutSession, ShippingMethod } from './checkout.entity';
import { Coupon } from './coupon.entity';
import { ProductVariant } from './product.entity';
import { AbstractEntity, SoftDeleteAbstractEntity } from '@/common/entities';

@Entity('orders')
export class Order extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => GuestCheckout, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guest_id' })
  guest: GuestCheckout | null;

  @ManyToOne(() => CheckoutSession, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'checkout_session_id' })
  checkoutSession: CheckoutSession | null;

  @ManyToOne(() => ShippingMethod, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod: ShippingMethod | null;

  @ManyToOne(() => Coupon, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'tracking_number', length: 100, nullable: true })
  trackingNumber: string | null;

  @Column({ name: 'contact_snapshot', type: 'jsonb' })
  contactSnapshot: {
    email: string;
    phone: string;
    fullName: string;
  };

  @Column({ name: 'shipping_snapshot', type: 'jsonb' })
  shippingSnapshot: {
    recipientName: string;
    street: string;
    city: string;
    country: string;
    postalCode?: string;
    shippingMethodName: string;
  };

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'shipping_fee', type: 'numeric', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}

@Entity('order_items')
export class OrderItem extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'shape_surcharge', type: 'numeric', precision: 10, scale: 2, default: 0 })
  shapeSurcharge: number;

  @Column({ name: 'item_discount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  itemDiscount: number;

  @Column({ name: 'shape_name', length: 100 })
  shapeName: string;

  @Column({ name: 'size_label', length: 20 })
  sizeLabel: string;

  @Column({ name: 'is_custom_size', default: false })
  isCustomSize: boolean;

  @OneToOne(() => CustomSizeRequest, (r) => r.orderItem)
  customSizeRequest: CustomSizeRequest;
}

@Entity('custom_size_requests')
export class CustomSizeRequest extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => OrderItem, (item) => item.customSizeRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ length: 10, nullable: true })
  thumb: string | null;

  @Column({ name: 'index_finger', length: 10, nullable: true })
  indexFinger: string | null;

  @Column({ name: 'middle_finger', length: 10, nullable: true })
  middleFinger: string | null;

  @Column({ name: 'ring_finger', length: 10, nullable: true })
  ringFinger: string | null;

  @Column({ length: 10, nullable: true })
  pinky: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
