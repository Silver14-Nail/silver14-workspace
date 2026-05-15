import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { WholesalePaymentStatus, WholesalePaymentTerms } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { Order } from '../orders/order.entity';
import { WholesaleAccount } from './wholesale-account.entity';

@Entity('wholesale_orders')
export class WholesaleOrder extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WholesaleAccount, (a) => a.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wholesale_account_id' })
  account: WholesaleAccount;

  @OneToOne(() => Order, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    name: 'po_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  poNumber: string | null;

  @Column({
    name: 'wholesale_discount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
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

  @Column({
    name: 'due_date',
    type: 'timestamptz',
    nullable: true,
  })
  dueDate: Date | null;
}
