import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AuthProviderName } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

import { UserAuthIdentityDto } from './user-auth-identities.dto';
import { OAuthStateTokenDto } from './oauth-state-tokens.dto';

export class AuthProviderDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsEnum(AuthProviderName)
  name: AuthProviderName;

  @IsString()
  @Length(1, 50)
  displayName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAuthIdentityDto)
  identities?: UserAuthIdentityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OAuthStateTokenDto)
  stateTokens?: OAuthStateTokenDto[];
}
