import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AuthProviderName, LoginMethod, UserRole } from '@/common/enums/entity.enum';
import { AbstractEntity, SoftDeleteAbstractEntity } from '@/common/entities';

@Entity('users')
export class User extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'password_hash', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => UserAuthIdentity, (i) => i.user)
  authIdentities: UserAuthIdentity[];

  @OneToMany(() => UserSession, (s) => s.user)
  sessions: UserSession[];

  @OneToMany(() => PasswordReset, (r) => r.user)
  passwordResets: PasswordReset[];

  @OneToMany(() => EmailVerification, (v) => v.user)
  emailVerifications: EmailVerification[];

  @OneToMany(() => Address, (a) => a.user)
  addresses: Address[];
}

@Entity('auth_providers')
export class AuthProvider extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'enum', enum: AuthProviderName, unique: true })
  name: AuthProviderName;

  @Column({ name: 'display_name', length: 50 })
  displayName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => UserAuthIdentity, (i) => i.provider)
  identities: UserAuthIdentity[];

  @OneToMany(() => OAuthStateToken, (t) => t.provider)
  stateTokens: OAuthStateToken[];
}

@Entity('user_auth_identities')
@Index(['provider', 'providerUserId'], { unique: true })
export class UserAuthIdentity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.authIdentities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AuthProvider, (p) => p.identities)
  @JoinColumn({ name: 'provider_id' })
  provider: AuthProvider;

  @Column({ name: 'provider_user_id', length: 255 })
  providerUserId: string;

  @Column({ name: 'provider_email', length: 255, nullable: true })
  providerEmail: string | null;

  @Column({ name: 'access_token_hash', length: 255, nullable: true })
  accessTokenHash: string | null;

  @Column({ name: 'refresh_token_hash', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @Column({ name: 'raw_profile', type: 'jsonb', nullable: true })
  rawProfile: Record<string, any> | null;

  @Column({ name: 'token_expires_at', type: 'timestamptz', nullable: true })
  tokenExpiresAt: Date | null;

  @CreateDateColumn({ name: 'linked_at', type: 'timestamptz' })
  linkedAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @OneToMany(() => UserSession, (s) => s.identity)
  sessions: UserSession[];
}

@Entity('user_sessions')
export class UserSession extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => UserAuthIdentity, (i) => i.sessions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'identity_id' })
  identity: UserAuthIdentity | null;

  @Index({ unique: true })
  @Column({ name: 'token_hash', length: 255, unique: true })
  tokenHash: string;

  @Column({ name: 'login_method', type: 'enum', enum: LoginMethod })
  loginMethod: LoginMethod;

  @Column({ name: 'device_info', length: 500, nullable: true })
  deviceInfo: string | null;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}

@Entity('oauth_state_tokens')
export class OAuthStateToken extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'state_token', length: 255, unique: true })
  stateToken: string;

  @ManyToOne(() => AuthProvider, (p) => p.stateTokens)
  @JoinColumn({ name: 'provider_id' })
  provider: AuthProvider;

  @Column({ name: 'redirect_uri', length: 500, nullable: true })
  redirectUri: string | null;

  @Column({ name: 'code_verifier', length: 255, nullable: true })
  codeVerifier: string | null;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}

@Entity('password_resets')
export class PasswordReset extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.passwordResets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index({ unique: true })
  @Column({ name: 'token_hash', length: 255, unique: true })
  tokenHash: string;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}

@Entity('email_verifications')
export class EmailVerification extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.emailVerifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index({ unique: true })
  @Column({ name: 'token_hash', length: 255, unique: true })
  tokenHash: string;

  @Column({ name: 'new_email', length: 255, nullable: true })
  newEmail: string | null;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}

@Entity('addresses')
export class Address extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'recipient_name', length: 100 })
  recipientName: string;

  @Column({ length: 255 })
  street: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  country: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string | null;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}
