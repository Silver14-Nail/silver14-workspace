import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { UserRole } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { Address } from './address.entity';
import { UserAuthIdentity } from './user-auth-identities.entity';
import { UserSession } from './user-session.entity';
import { PasswordReset } from './password-resets.entity';
import { EmailVerification } from './email-verifications.entity';

@Entity('users')
export class User extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 100,
  })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  avatarUrl: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    name: 'email_verified',
    type: 'boolean',
    default: false,
  })
  emailVerified: boolean;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
  })
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
