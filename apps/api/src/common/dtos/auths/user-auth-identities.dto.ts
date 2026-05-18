import {
  IsArray,
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from './user.dto';
import { AuthProviderDto } from './auth-provider.dto';
import { UserSessionDto } from './user-session.dto';

export class UserAuthIdentityDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @ValidateNested()
  @Type(() => AuthProviderDto)
  provider: AuthProviderDto;

  @IsString()
  @Length(1, 255)
  providerUserId: string;

  @IsOptional()
  @IsEmail()
  @Length(1, 255)
  providerEmail?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  accessTokenHash?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  refreshTokenHash?: string | null;

  @IsOptional()
  @IsObject()
  rawProfile?: Record<string, any> | null;

  @IsOptional()
  @IsDateString()
  tokenExpiresAt?: Date | null;

  @IsOptional()
  @IsDateString()
  linkedAt?: Date;

  @IsOptional()
  @IsDateString()
  lastUsedAt?: Date | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserSessionDto)
  sessions?: UserSessionDto[];
}
