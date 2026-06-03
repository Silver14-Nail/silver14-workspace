import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';
import { PaymentEntity } from './payment.entity';

export type TwocheckoutDetailStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'cancelled';

@Entity('twocheckout_details')
export class TwocheckoutDetailEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PaymentEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity | null;

  @Column({ name: 'checkout_session_id', type: 'varchar', length: 255 })
  checkoutSessionId: string;

  /** 2Checkout internal order reference number (REFNO) */
  @Column({ name: 'ref_no', type: 'varchar', length: 100, nullable: true })
  refNo: string | null;

  /** Our merchant order reference sent to 2Checkout (= checkoutSessionId) */
  @Column({ name: 'merchant_order_ref', type: 'varchar', length: 255, nullable: true })
  merchantOrderRef: string | null;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: TwocheckoutDetailStatus;

  /** Payment URL returned by 2Checkout for redirect */
  @Column({ name: 'payment_url', type: 'varchar', length: 1000, nullable: true })
  paymentUrl: string | null;

  /** Payment method used (e.g. CCVISAMC, PAYPAL) */
  @Column({ name: 'pay_method', type: 'varchar', length: 100, nullable: true })
  payMethod: string | null;

  /** Card last 4 digits if card payment */
  @Column({ name: 'card_last4', type: 'varchar', length: 4, nullable: true })
  cardLast4: string | null;

  /** Raw IPN webhook payload */
  @Column({ name: 'ipn_payload', type: 'json', nullable: true })
  ipnPayload: Record<string, any> | null;

  @Column({ name: 'gateway_response', type: 'json', nullable: true })
  gatewayResponse: Record<string, any> | null;
}
