import { IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from '../auths/user.dto';
import { CouponDto } from './coupon.dto';

export class CouponUserWhitelistDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponDto)
  coupon?: CouponDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto;
}
