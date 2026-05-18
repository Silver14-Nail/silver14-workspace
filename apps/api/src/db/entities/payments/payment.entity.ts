import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PaymentGateway, PaymentStatus } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { OrderEntity } from '../orders/order.entity';
import { PaypalDetailEntity } from './paypal-detail.entity';
import { CardDetailEntity } from './card-detail.entity';

@Entity('payments')
export class PaymentEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => OrderEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({
    type: 'enum',
    enum: PaymentGateway,
  })
  gateway: PaymentGateway;

  @Column({
    name: 'gateway_txn_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  gatewayTxnId: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
  })
  currency: string;

  @Column({
    name: 'gateway_response',
    type: 'json',
    nullable: true,
  })
  gatewayResponse: Record<string, any> | null;

  @Column({
    name: 'paid_at',
    type: 'timestamp',
    nullable: true,
  })
  paidAt: Date | null;

  @OneToOne(() => PaypalDetailEntity, (d) => d.payment)
  paypalDetail: PaypalDetailEntity;

  @OneToOne(() => CardDetailEntity, (d) => d.payment)
  cardDetail: CardDetailEntity;
}
