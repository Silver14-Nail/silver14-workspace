import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../../common/entities';

import { OrderItem } from './order-item.entity';

@Entity('custom_size_requests')
export class CustomSizeRequest extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => OrderItem, (item) => item.customSizeRequest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  thumb: string | null;

  @Column({
    name: 'index_finger',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  indexFinger: string | null;

  @Column({
    name: 'middle_finger',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  middleFinger: string | null;

  @Column({
    name: 'ring_finger',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  ringFinger: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  pinky: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;
}
