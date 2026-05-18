import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from './user.dto';

export class PasswordResetDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @IsString()
  @Length(1, 255)
  tokenHash: string;

  @IsOptional()
  @IsBoolean()
  isUsed?: boolean;

  @IsDateString()
  expiresAt: Date;
}
