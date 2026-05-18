import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CheckoutSessionStatus, CheckoutStep } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { CartDto } from './cart.dto';
import { UserDto } from '../auths/user.dto';
import { GuestCheckoutDto } from './guest-checkout.dto';

export class CheckoutSessionDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => CartDto)
  cart: CartDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestCheckoutDto)
  guest?: GuestCheckoutDto | null;

  @IsOptional()
  @IsEnum(CheckoutStep)
  currentStep?: CheckoutStep;

  @IsOptional()
  @IsObject()
  contactSnapshot?: Record<string, any> | null;

  @IsOptional()
  @IsObject()
  shippingSnapshot?: Record<string, any> | null;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  couponCode?: string | null;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsEnum(CheckoutSessionStatus)
  status?: CheckoutSessionStatus;

  @IsDateString()
  expiresAt: Date;
}
