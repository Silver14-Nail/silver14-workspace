import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../../common/entities';
import { PaymentEntity } from './payment.entity';

/**
 * Stores Ngân Lượng-specific payment details.
 */
@Entity('nganluong_details')
export class NgLuongDetailEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PaymentEntity, (p) => p.ngLuongDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  /** The checkout session ID used to create this order */
  @Column({ name: 'checkout_session_id', type: 'varchar', length: 36 })
  checkoutSessionId: string;

  /** Ngân Lượng token returned from SetExpressCheckout */
  @Column({ name: 'nl_token', type: 'varchar', length: 255, nullable: true })
  nlToken: string;

  /** Merchant order_code sent to Ngân Lượng (same as checkoutSessionId) */
  @Column({ name: 'order_code', type: 'varchar', length: 150 })
  orderCode: string;

  /** Ngân Lượng transaction_id from order check */
  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  /** Amount in VND (Ngân Lượng amount = real amount * 100 for VND) */
  @Column({ name: 'amount_vnd', type: 'bigint' })
  amountVnd: number;

  /** Payment method sent to Ngân Lượng */
  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: string;

  /** Bank code sent to Ngân Lượng */
  @Column({ name: 'bank_code', type: 'varchar', length: 50 })
  bankCode: string;

  /** Status: pending, processing, succeeded, failed, cancelled */
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  /** Raw SetExpressCheckout response */
  @Column({ name: 'checkout_response', type: 'json', nullable: true })
  checkoutResponse: Record<string, any> | null;

  /** Raw order check response */
  @Column({ name: 'order_check_response', type: 'json', nullable: true })
  orderCheckResponse: Record<string, any> | null;

  /** Raw webhook/notify payload */
  @Column({ name: 'webhook_payload', type: 'json', nullable: true })
  webhookPayload: Record<string, any> | null;

  /** Card/bank info from callback */
  @Column({ name: 'card_brand', type: 'varchar', length: 50, nullable: true })
  cardBrand: string | null;

  @Column({ name: 'card_last4', type: 'varchar', length: 10, nullable: true })
  cardLast4: string | null;
}
