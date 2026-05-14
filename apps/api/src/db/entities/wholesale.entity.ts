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
import {
  NewsletterSource,
  NewsletterStatus,
  WholesaleEnquiryStatus,
  WholesalePaymentStatus,
  WholesalePaymentTerms,
  WholesaleTierName,
} from '@/common/enums/entity.enum';
import { User } from './auth.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { AbstractEntity, SoftDeleteAbstractEntity } from '@/common/entities';

@Entity('wholesale_enquiries')
export class WholesaleEnquiry extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 100 })
  country: string;

  @Column({ name: 'business_name', length: 200, nullable: true })
  businessName: string | null;

  @Column({ name: 'business_type', length: 100, nullable: true })
  businessType: string | null;

  @Column({ name: 'monthly_order_qty_range', length: 50, nullable: true })
  monthlyOrderQtyRange: string | null;

  @Column({ name: 'collections_of_interest', type: 'jsonb', nullable: true })
  collectionsOfInterest: string[] | null;

  @Column({ name: 'additional_message', type: 'text', nullable: true })
  additionalMessage: string | null;

  @Column({ type: 'enum', enum: WholesaleEnquiryStatus, default: WholesaleEnquiryStatus.PENDING })
  status: WholesaleEnquiryStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'handled_by' })
  handledBy: User | null;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date | null;

  @OneToOne(() => WholesaleAccount, (a) => a.enquiry)
  account: WholesaleAccount;
}

@Entity('wholesale_tiers')
export class WholesaleTier extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: WholesaleTierName, unique: true })
  name: WholesaleTierName;

  @Column({ name: 'min_monthly_qty', default: 0 })
  minMonthlyQty: number;

  @Column({ name: 'discount_percent', type: 'numeric', precision: 5, scale: 2 })
  discountPercent: number;

  @Column({ name: 'max_discount_amount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column({ name: 'free_shipping', default: false })
  freeShipping: boolean;

  @Column({ name: 'min_order_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  minOrderAmount: number;

  @OneToMany(() => WholesaleAccount, (a) => a.tier)
  accounts: WholesaleAccount[];
}

@Entity('wholesale_accounts')
export class WholesaleAccount extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => WholesaleEnquiry, (e) => e.account, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enquiry_id' })
  enquiry: WholesaleEnquiry;

  @ManyToOne(() => WholesaleTier, (t) => t.accounts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tier_id' })
  tier: WholesaleTier;

  @Column({ name: 'business_name', length: 200, nullable: true })
  businessName: string | null;

  @Column({ length: 100 })
  country: string;

  @Column({ name: 'credit_limit', type: 'numeric', precision: 12, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ name: 'current_balance', type: 'numeric', precision: 12, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User | null;

  @OneToMany(() => WholesaleProductPricing, (p) => p.account)
  productPricings: WholesaleProductPricing[];

  @OneToMany(() => WholesaleOrder, (o) => o.account)
  orders: WholesaleOrder[];
}

@Entity('wholesale_product_pricings')
@Index(['account', 'product'], { unique: true })
export class WholesaleProductPricing extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WholesaleAccount, (a) => a.productPricings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wholesale_account_id' })
  account: WholesaleAccount;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'override_price', type: 'numeric', precision: 10, scale: 2, nullable: true })
  overridePrice: number | null;

  @Column({ name: 'discount_percent', type: 'numeric', precision: 5, scale: 2, nullable: true })
  discountPercent: number | null;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;
}

@Entity('wholesale_orders')
export class WholesaleOrder extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WholesaleAccount, (a) => a.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wholesale_account_id' })
  account: WholesaleAccount;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'po_number', length: 100, nullable: true })
  poNumber: string | null;

  @Column({ name: 'wholesale_discount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  wholesaleDiscount: number;

  @Column({
    name: 'payment_terms',
    type: 'enum',
    enum: WholesalePaymentTerms,
    default: WholesalePaymentTerms.PREPAID,
  })
  paymentTerms: WholesalePaymentTerms;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: WholesalePaymentStatus,
    default: WholesalePaymentStatus.UNPAID,
  })
  paymentStatus: WholesalePaymentStatus;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null;
}

@Entity('newsletter_subscribers')
export class NewsletterSubscriber extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 255, unique: true })
  email: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'enum', enum: NewsletterStatus, default: NewsletterStatus.ACTIVE })
  status: NewsletterStatus;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, boolean> | null;

  @Column({ type: 'enum', enum: NewsletterSource })
  source: NewsletterSource;

  @Column({ name: 'unsubscribed_at', type: 'timestamptz', nullable: true })
  unsubscribedAt: Date | null;
}
