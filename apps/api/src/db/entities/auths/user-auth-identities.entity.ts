import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { UserEntity } from './user.entity';
import { AuthProviderEntity } from './auth-provider.entity';
import { UserSessionEntity } from './user-session.entity';

@Entity('user_auth_identities')
export class UserAuthIdentityEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (u) => u.authIdentities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => AuthProviderEntity, (p) => p.identities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: AuthProviderEntity;

  @Column({
    name: 'provider_user_id',
    type: 'varchar',
    length: 255,
  })
  providerUserId: string;

  @Column({
    name: 'provider_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerEmail: string | null;

  @Column({
    name: 'access_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  accessTokenHash: string | null;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshTokenHash: string | null;

  @Column({
    name: 'raw_profile',
    type: 'json',
    nullable: true,
  })
  rawProfile: Record<string, any> | null;

  @Column({
    name: 'token_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  tokenExpiresAt: Date | null;

  @CreateDateColumn({
    name: 'linked_at',
    type: 'timestamp',
  })
  linkedAt: Date;

  @Column({
    name: 'last_used_at',
    type: 'timestamp',
    nullable: true,
  })
  lastUsedAt: Date | null;

  @OneToMany(() => UserSessionEntity, (s) => s.identity)
  sessions: UserSessionEntity[];
}
