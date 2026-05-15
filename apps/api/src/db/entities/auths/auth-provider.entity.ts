import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { AuthProviderName } from '../../../common/enums/entity.enum';

import { AbstractEntity } from '../../../common/entities';
import { OAuthStateToken } from './oauth-state-tokens.entity';
import { UserAuthIdentity } from './user-auth-identities.entity';

@Entity('auth_providers')
export class AuthProvider extends AbstractEntity {
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

  @OneToMany(() => UserAuthIdentity, (i) => i.provider)
  identities: UserAuthIdentity[];

  @OneToMany(() => OAuthStateToken, (t) => t.provider)
  stateTokens: OAuthStateToken[];
}
