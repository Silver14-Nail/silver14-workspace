import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AbstractEntity } from '../../../common/entities';

@Entity('guest_checkouts')
export class GuestCheckoutEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  phone: string;

  @Column({
    name: 'tracking_token',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  trackingToken: string;
}
