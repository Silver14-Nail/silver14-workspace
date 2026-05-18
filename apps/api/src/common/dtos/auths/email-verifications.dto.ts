import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsEmail,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from './user.dto';

export class EmailVerificationDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @IsString()
  @Length(1, 255)
  tokenHash: string;

  @IsOptional()
  @IsEmail()
  @Length(1, 255)
  newEmail?: string | null;

  @IsOptional()
  @IsBoolean()
  isUsed?: boolean;

  @IsDateString()
  expiresAt: Date;
}
