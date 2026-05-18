import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CouponRestrictionType } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

import { CouponDto } from './coupon.dto';

export class CouponRestrictionDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponDto)
  coupon?: CouponDto;

  @IsEnum(CouponRestrictionType)
  restrictionType: CouponRestrictionType;

  @IsOptional()
  @IsString()
  refId?: string | null;

  @IsOptional()
  @IsString()
  refLabel?: string | null;
}
