import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { AuthProviderName } from '../../../common/enums/entity.enum';

import { AbstractEntity } from '../../../common/entities';
import { OAuthStateTokenEntity } from './oauth-state-tokens.entity';
import { UserAuthIdentityEntity } from './user-auth-identities.entity';

@Entity('auth_providers')
export class AuthProviderEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuthProviderName,
    unique: true,
  })
  name: AuthProviderName;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 50,
  })
  displayName: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => UserAuthIdentityEntity, (i) => i.provider)
  identities: UserAuthIdentityEntity[];

  @OneToMany(() => OAuthStateTokenEntity, (t) => t.provider)
  stateTokens: OAuthStateTokenEntity[];
}
