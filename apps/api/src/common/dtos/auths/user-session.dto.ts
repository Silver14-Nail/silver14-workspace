import {
  IsDateString,
  IsEnum,
  IsIP,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { LoginMethod } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from './user.dto';
import { UserAuthIdentityDto } from './user-auth-identities.dto';

export class UserSessionDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserAuthIdentityDto)
  identity?: UserAuthIdentityDto | null;

  @IsString()
  @Length(1, 255)
  tokenHash: string;

  @IsEnum(LoginMethod)
  loginMethod: LoginMethod;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  deviceInfo?: string | null;

  @IsOptional()
  @IsIP()
  @Length(1, 45)
  ipAddress?: string | null;

  @IsDateString()
  expiresAt: Date;
}
