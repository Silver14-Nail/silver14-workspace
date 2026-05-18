import { IsArray, IsDateString, IsEnum, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { CartStatus } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { UserDto } from '../auths/user.dto';
import { GuestCheckoutDto } from './guest-checkout.dto';
import { CartItemDto } from './cart-item.dto';
import { CheckoutSessionDto } from './checkout-session.dto';

export class CartDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestCheckoutDto)
  guest?: GuestCheckoutDto | null;

  @IsOptional()
  @IsEnum(CartStatus)
  status?: CartStatus;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items?: CartItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutSessionDto)
  checkoutSession?: CheckoutSessionDto;
}
