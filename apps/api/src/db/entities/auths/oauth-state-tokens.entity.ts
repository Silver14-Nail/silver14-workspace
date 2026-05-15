import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { AuthProvider } from './auth-provider.entity';

@Entity('oauth_state_tokens')
export class OAuthStateToken extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'state_token',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  stateToken: string;

  @ManyToOne(() => AuthProvider, (p) => p.stateTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: AuthProvider;

  @Column({
    name: 'redirect_uri',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  redirectUri: string | null;

  @Column({
    name: 'code_verifier',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  codeVerifier: string | null;

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
