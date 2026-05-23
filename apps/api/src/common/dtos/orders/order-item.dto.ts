import {
  IsBoolean,
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

import { AbstractDTO } from '../abstract.dto';

import { ProductVariantDto } from '../products/product-variant.dto';
import { OrderDto } from './order.dto';
import { CustomSizeRequestDto } from './custom-size-request.dto';

export class OrderItemDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderDto)
  order?: OrderDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductVariantDto)
  variant?: ProductVariantDto;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  shapeSurcharge: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  itemDiscount: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  shapeName: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  sizeLabel: string | null;

  @IsBoolean()
  isCustomSize: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomSizeRequestDto)
  customSizeRequest?: CustomSizeRequestDto;
}
