import { IsInt, IsNumber, IsOptional, Min, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { ProductDto } from './product.dto';
import { NailShapeDto } from './nail-shape.dto';
import { NailSizeDto } from './nail-size.dto';

export class ProductVariantDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDto)
  product?: ProductDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NailShapeDto)
  shape?: NailShapeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NailSizeDto)
  size?: NailSizeDto;

  @IsInt()
  @Min(0)
  stockQty: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  computedPrice: number;
}
