import {
  IsArray,
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

import { OrderStatus } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { UserDto } from '../auths/user.dto';
import { GuestCheckoutDto } from '../checkouts/guest-checkout.dto';
import { CheckoutSessionDto } from '../checkouts/checkout-session.dto';
import { ShippingMethodDto } from '../checkouts/shipping-method.dto';
import { CouponDto } from '../coupons/coupon.dto';
import { OrderItemDto } from './order-item.dto';

export class OrderDto extends SoftDeleteAbstractDTO {
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
  @ValidateNested()
  @Type(() => CheckoutSessionDto)
  checkoutSession?: CheckoutSessionDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingMethodDto)
  shippingMethod?: ShippingMethodDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponDto)
  coupon?: CouponDto | null;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  trackingNumber?: string | null;

  @IsObject()
  contactSnapshot: {
    email: string;
    phone: string;
    fullName: string;
  };

  @IsObject()
  shippingSnapshot: {
    recipientName: string;
    street: string;
    city: string;
    country: string;
    postalCode?: string;
    shippingMethodName: string;
  };

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  shippingFee: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}
