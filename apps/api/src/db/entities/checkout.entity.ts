import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CartStatus, CheckoutSessionStatus, CheckoutStep } from '@/common/enums/entity.enum';
import { User } from './auth.entity';
import { ProductVariant } from './product.entity';
import { AbstractEntity, SoftDeleteAbstractEntity } from '@/common/entities';

@Entity('guest_checkouts')
export class GuestCheckout extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @Index({ unique: true })
  @Column({ length: 20, unique: true })
  phone: string;

  @Index({ unique: true })
  @Column({ name: 'tracking_token', length: 255, unique: true })
  trackingToken: string;
}

@Entity('carts')
export class Cart extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => GuestCheckout, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guest_id' })
  guest: GuestCheckout | null;

  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];

  @OneToOne(() => CheckoutSession, (cs) => cs.cart)
  checkoutSession: CheckoutSession;
}

@Entity('cart_items')
export class CartItem extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'is_custom_size', default: false })
  isCustomSize: boolean;

  @Column({ name: 'custom_measurements', type: 'jsonb', nullable: true })
  customMeasurements: {
    thumb?: string;
    index?: string;
    middle?: string;
    ring?: string;
    pinky?: string;
    notes?: string;
  } | null;
}

@Entity('shipping_methods')
export class ShippingMethod extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  carrier: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'est_days_min', nullable: true })
  estDaysMin: number | null;

  @Column({ name: 'est_days_max', nullable: true })
  estDaysMax: number | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

@Entity('checkout_sessions')
export class CheckoutSession extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Cart, (c) => c.checkoutSession, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => GuestCheckout, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guest_id' })
  guest: GuestCheckout | null;

  @Column({ name: 'current_step', type: 'int', default: CheckoutStep.CONTACT })
  currentStep: CheckoutStep;

  @Column({ name: 'contact_snapshot', type: 'jsonb', nullable: true })
  contactSnapshot: Record<string, any> | null;

  @Column({ name: 'shipping_snapshot', type: 'jsonb', nullable: true })
  shippingSnapshot: Record<string, any> | null;

  @Column({ name: 'coupon_code', length: 50, nullable: true })
  couponCode: string | null;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'enum', enum: CheckoutSessionStatus, default: CheckoutSessionStatus.IN_PROGRESS })
  status: CheckoutSessionStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
