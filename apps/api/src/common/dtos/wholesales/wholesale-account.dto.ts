import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { UserDto } from '../auths/user.dto';
import { WholesaleEnquiryDto } from './wholesale-enquiry.dto';
import { WholesaleTierDto } from './wholesale-tier.dto';
import { WholesaleProductPricingDto } from './wholesale-product-pricing.dto';
import { WholesaleOrderDto } from './wholesale-order.dto';

export class WholesaleAccountDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WholesaleEnquiryDto)
  enquiry?: WholesaleEnquiryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WholesaleTierDto)
  tier?: WholesaleTierDto;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  businessName?: string | null;

  @IsString()
  @Length(1, 100)
  country: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  creditLimit: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentBalance: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsDateString()
  approvedAt?: Date | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  approvedBy?: UserDto | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WholesaleProductPricingDto)
  productPricings?: WholesaleProductPricingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WholesaleOrderDto)
  orders?: WholesaleOrderDto[];
}
