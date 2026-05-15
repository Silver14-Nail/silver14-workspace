import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { CardBrand, CardProcessor } from '../../../common/enums/entity.enum';
import { AbstractEntity } from '../../../common/entities';

import { Payment } from './payment.entity';

@Entity('card_details')
export class CardDetail extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Payment, (p) => p.cardDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({
    type: 'enum',
    enum: CardProcessor,
  })
  processor: CardProcessor;

  @Column({
    type: 'varchar',
    length: 4,
  })
  last4: string;

  @Column({
    type: 'enum',
    enum: CardBrand,
  })
  brand: CardBrand;

  @Column({
    name: 'auth_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  authCode: string | null;

  @Column({
    name: 'charge_id',
    type: 'varchar',
    length: 100,
  })
  chargeId: string;
}
