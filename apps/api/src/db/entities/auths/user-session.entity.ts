import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { LoginMethod } from '../../../common/enums/entity.enum';

import { AbstractEntity } from '../../../common/entities';

import { User } from './user.entity';
import { UserAuthIdentity } from './user-auth-identities.entity';

@Entity('user_sessions')
export class UserSession extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => UserAuthIdentity, (i) => i.sessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'identity_id' })
  identity: UserAuthIdentity | null;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  tokenHash: string;

  @Column({
    name: 'login_method',
    type: 'enum',
    enum: LoginMethod,
  })
  loginMethod: LoginMethod;

  @Column({
    name: 'device_info',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  deviceInfo: string | null;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress: string | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;
}
