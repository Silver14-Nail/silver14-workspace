import {
  IsArray,
  IsBoolean,
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

import { ProductImageDto } from './product-image.dto';
import { ProductShapePricingDto } from './product-shape-pricing.dto';
import { ProductVariantDto } from './product-variant.dto';

export class ProductDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductShapePricingDto)
  shapePricings?: ProductShapePricingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
