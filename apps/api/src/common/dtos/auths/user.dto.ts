import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UserRole } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { UserAuthIdentityDto } from './user-auth-identities.dto';
import { UserSessionDto } from './user-session.dto';
import { PasswordResetDto } from './password-resets.dto';
import { EmailVerificationDto } from './email-verifications.dto';
import { AddressDto } from './address.dto';

export class UserDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 100)
  fullName: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  passwordHash?: string | null;

  @IsOptional()
  @IsUrl()
  @Length(1, 500)
  avatarUrl?: string | null;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAuthIdentityDto)
  authIdentities?: UserAuthIdentityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserSessionDto)
  sessions?: UserSessionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PasswordResetDto)
  passwordResets?: PasswordResetDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailVerificationDto)
  emailVerifications?: EmailVerificationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];
}
