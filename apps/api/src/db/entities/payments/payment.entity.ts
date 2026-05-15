import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PaymentGateway, PaymentStatus } from '../../../common/enums/entity.enum';
import { Order } from '../orders/order.entity';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { PaypalDetail } from './paypal-detail.entity';
import { CardDetail } from './card-detail.entity';

@Entity('payments')
export class Payment extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

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
    type: 'jsonb',
    nullable: true,
  })
  gatewayResponse: Record<string, any> | null;

  @Column({
    name: 'paid_at',
    type: 'timestamptz',
    nullable: true,
  })
  paidAt: Date | null;

  @OneToOne(() => PaypalDetail, (d) => d.payment)
  paypalDetail: PaypalDetail;

  @OneToOne(() => CardDetail, (d) => d.payment)
  cardDetail: CardDetail;
}
