import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';

import { UserRole } from '@/common/enums/entity.enum';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @Length(1, 500)
  avatarUrl?: string | null;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
