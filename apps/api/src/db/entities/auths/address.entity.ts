import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { UserEntity } from './user.entity';

@Entity('addresses')
export class AddressEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (u) => u.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'recipient_name',
    type: 'varchar',
    length: 100,
  })
  recipientName: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  street: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  country: string;

  @Column({
    name: 'postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  postalCode: string | null;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;
}
