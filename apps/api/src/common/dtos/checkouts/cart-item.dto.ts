import {
  IsBoolean,
  IsInt,
  IsString,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { CartDto } from './cart.dto';
import { ProductVariantDto } from '../products/product-variant.dto';

class CustomMeasurementsDto {
  @IsOptional()
  @IsString()
  thumb?: string;

  @IsOptional()
  @IsString()
  index?: string;

  @IsOptional()
  @IsString()
  middle?: string;

  @IsOptional()
  @IsString()
  ring?: string;

  @IsOptional()
  @IsString()
  pinky?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CartItemDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => CartDto)
  cart: CartDto;

  @ValidateNested()
  @Type(() => ProductVariantDto)
  variant: ProductVariantDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  isCustomSize?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CustomMeasurementsDto)
  customMeasurements?: CustomMeasurementsDto | null;
}
