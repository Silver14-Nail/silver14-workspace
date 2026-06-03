import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../../common/entities';
import { PaymentEntity } from './payment.entity';

/**
 * Stores OnePAY-specific payment details.
 *
 * Key OnePAY fields:
 *  - vpc_MerchTxnRef  — unique merchant transaction reference we generated
 *  - vpc_TransactionNo — OnePAY's own transaction number (returned in callback)
 *  - vpc_TxnResponseCode — "0" = success
 *  - amountOnepay — VND * 100 as sent to gateway
 */
@Entity('onepay_details')
export class OnepayDetailEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PaymentEntity, (p) => p.onepayDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  /** Checkout session ID */
  @Column({ name: 'checkout_session_id', type: 'varchar', length: 36 })
  checkoutSessionId: string;

  /** Unique merchant txn ref sent to OnePAY */
  @Column({ name: 'merch_txn_ref', type: 'varchar', length: 40 })
  merchTxnRef: string;

  /** OnePAY's gateway transaction number */
  @Column({ name: 'transaction_no', type: 'varchar', length: 50, nullable: true })
  transactionNo: string | null;

  /** vpc_TxnResponseCode — "0" = success */
  @Column({ name: 'txn_response_code', type: 'varchar', length: 10, nullable: true })
  txnResponseCode: string | null;

  /** Amount sent to OnePAY (VND * 100) */
  @Column({ name: 'amount_onepay', type: 'bigint' })
  amountOnepay: number;

  /** Card list filter used (INTERNATIONAL / DOMESTIC / QR / BIN code) */
  @Column({ name: 'card_list', type: 'varchar', length: 256, nullable: true })
  cardList: string | null;

  /** Card type returned by OnePAY (VC, MC, JC, BIN, …) */
  @Column({ name: 'vpc_card', type: 'varchar', length: 20, nullable: true })
  vpcCard: string | null;

  /** Pay channel: WEB | APP */
  @Column({ name: 'pay_channel', type: 'varchar', length: 20, nullable: true })
  payChannel: string | null;

  /** Masked card number from OnePAY (e.g. 412345xxxxxx1234) */
  @Column({ name: 'card_num', type: 'varchar', length: 32, nullable: true })
  cardNum: string | null;

  /** Status: pending | processing | succeeded | failed | cancelled */
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  /** Raw return/IPN callback payload stored for audit */
  @Column({ name: 'callback_payload', type: 'json', nullable: true })
  callbackPayload: Record<string, any> | null;

  /** Raw QueryDR response */
  @Column({ name: 'query_dr_response', type: 'json', nullable: true })
  queryDrResponse: Record<string, any> | null;
}
