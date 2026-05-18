import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { PaymentEntity } from './payment.entity';

@Entity('paypal_details')
export class PaypalDetailEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PaymentEntity, (p) => p.paypalDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @Column({
    name: 'paypal_order_id',
    type: 'varchar',
    length: 100,
  })
  paypalOrderId: string;

  @Column({
    name: 'payer_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  payerEmail: string | null;

  @Column({
    name: 'payer_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  payerId: string | null;

  @Column({
    name: 'capture_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  captureId: string | null;
}
