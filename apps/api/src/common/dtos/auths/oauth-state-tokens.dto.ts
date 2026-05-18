import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { AuthProviderDto } from './auth-provider.dto';

export class OAuthStateTokenDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 255)
  stateToken: string;

  @ValidateNested()
  @Type(() => AuthProviderDto)
  provider: AuthProviderDto;

  @IsOptional()
  @IsUrl()
  @Length(1, 500)
  redirectUri?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  codeVerifier?: string | null;

  @IsOptional()
  @IsBoolean()
  isUsed?: boolean;

  @IsDateString()
  expiresAt: Date;
}
