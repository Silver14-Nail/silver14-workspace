import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';
import { PaymentEntity } from './payment.entity';

export type AirwallexDetailStatus =
  | 'pending'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_customer_action'
  | 'processing'
  | 'requires_capture'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

@Entity('airwallex_details')
export class AirwallexDetailEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PaymentEntity, (p) => p.airwallexDetail, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity | null;

  @Column({
    name: 'checkout_session_id',
    type: 'varchar',
    length: 255,
  })
  checkoutSessionId: string;

  @Column({
    name: 'payment_intent_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paymentIntentId: string | null;

  @Column({
    name: 'checkout_session_ref',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  checkoutSessionRef: string | null;

  @Column({
    name: 'amount_cents',
    type: 'int',
  })
  amountCents: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
  })
  currency: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: AirwallexDetailStatus;

  @Column({
    name: 'customer_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerId: string | null;

  @Column({
    name: 'payment_method_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paymentMethodId: string | null;

  @Column({
    name: 'payment_method_types',
    type: 'simple-json',
    nullable: true,
  })
  paymentMethodTypes: string[] | null;

  @Column({
    name: 'client_secret',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  clientSecret: string | null;

  @Column({
    name: 'card_brand',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  cardBrand: string | null;

  @Column({
    name: 'card_last4',
    type: 'varchar',
    length: 4,
    nullable: true,
  })
  cardLast4: string | null;

  @Column({
    name: 'allow_save_card',
    type: 'boolean',
    default: false,
  })
  allowSaveCard: boolean;

  @Column({
    name: 'webhook_payload',
    type: 'json',
    nullable: true,
  })
  webhookPayload: Record<string, any> | null;

  @Column({
    name: 'gateway_response',
    type: 'json',
    nullable: true,
  })
  gatewayResponse: Record<string, any> | null;
}
