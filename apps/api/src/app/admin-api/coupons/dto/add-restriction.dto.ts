import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { CouponRestrictionType } from '@/common/enums/entity.enum';

export class AddRestrictionDto {
  @ApiProperty({ enum: CouponRestrictionType })
  @IsEnum(CouponRestrictionType)
  restrictionType: CouponRestrictionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  refId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  refLabel?: string | null;
}
