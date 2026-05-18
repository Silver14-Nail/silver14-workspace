import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { UserEntity } from './user.entity';

@Entity('password_resetsEntity')
export class PasswordResetEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (u) => u.passwordResets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  tokenHash: string;

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: false,
  })
  isUsed: boolean;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;
}
