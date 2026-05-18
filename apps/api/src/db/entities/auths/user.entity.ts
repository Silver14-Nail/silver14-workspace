import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { UserRole } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { AddressEntity } from './address.entity';
import { UserAuthIdentityEntity } from './user-auth-identities.entity';
import { UserSessionEntity } from './user-session.entity';
import { PasswordResetEntity } from './password-resets.entity';
import { EmailVerificationEntity } from './email-verifications.entity';

@Entity('users')
export class UserEntity extends SoftDeleteAbstractEntity {
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

  @OneToMany(() => UserAuthIdentityEntity, (i) => i.user)
  authIdentities: UserAuthIdentityEntity[];

  @OneToMany(() => UserSessionEntity, (s) => s.user)
  sessions: UserSessionEntity[];

  @OneToMany(() => PasswordResetEntity, (r) => r.user)
  passwordResets: PasswordResetEntity[];

  @OneToMany(() => EmailVerificationEntity, (v) => v.user)
  emailVerifications: EmailVerificationEntity[];

  @OneToMany(() => AddressEntity, (a) => a.user)
  addresses: AddressEntity[];
}
