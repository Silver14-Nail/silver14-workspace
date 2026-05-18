import { IsNumber, IsOptional, Min, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from '../auths/user.dto';
import { OrderDto } from '../orders/order.dto';
import { CouponDto } from './coupon.dto';

export class CouponUsageDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponDto)
  coupon?: CouponDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderDto)
  order?: OrderDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountApplied: number;
}
