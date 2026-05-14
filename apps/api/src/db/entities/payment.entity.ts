import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import {
  CardBrand,
  CardProcessor,
  PaymentGateway,
  PaymentStatus,
} from '@/common/enums/entity.enum';
import { Order } from './order.entity';
import { AbstractEntity, SoftDeleteAbstractEntity } from '@/common/entities';

@Entity('payments')
export class Payment extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'enum', enum: PaymentGateway })
  gateway: PaymentGateway;

  @Column({ name: 'gateway_txn_id', length: 255, nullable: true })
  gatewayTxnId: string | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any> | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @OneToOne(() => PaypalDetail, (d) => d.payment)
  paypalDetail: PaypalDetail;

  @OneToOne(() => CardDetail, (d) => d.payment)
  cardDetail: CardDetail;
}

@Entity('paypal_details')
export class PaypalDetail extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Payment, (p) => p.paypalDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ name: 'paypal_order_id', length: 100 })
  paypalOrderId: string;

  @Column({ name: 'payer_email', length: 255, nullable: true })
  payerEmail: string | null;

  @Column({ name: 'payer_id', length: 100, nullable: true })
  payerId: string | null;

  @Column({ name: 'capture_id', length: 100, nullable: true })
  captureId: string | null;
}

@Entity('card_details')
export class CardDetail extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Payment, (p) => p.cardDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ type: 'enum', enum: CardProcessor })
  processor: CardProcessor;

  @Column({ length: 4 })
  last4: string;

  @Column({ type: 'enum', enum: CardBrand })
  brand: CardBrand;

  @Column({ name: 'auth_code', length: 50, nullable: true })
  authCode: string | null;

  @Column({ name: 'charge_id', length: 100 })
  chargeId: string;
}
