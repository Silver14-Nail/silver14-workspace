import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { DiscountType } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { CouponRestrictionDto } from './coupon-restriction.dto';
import { CouponUserWhitelistDto } from './coupon-user-whitelist.dto';
import { CouponUsageDto } from './coupon-usage.dto';

export class CouponDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 50)
  code: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxDiscountAmount?: number | null;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderAmount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesTotal?: number | null;

  @IsInt()
  @Min(1)
  maxUsesPerUser: number;

  @IsInt()
  @Min(0)
  usedCount: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: Date | null;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponRestrictionDto)
  restrictions?: CouponRestrictionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponUserWhitelistDto)
  whitelist?: CouponUserWhitelistDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponUsageDto)
  usages?: CouponUsageDto[];
}
