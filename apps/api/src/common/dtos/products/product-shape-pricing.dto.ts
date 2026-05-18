import { IsBoolean, IsEnum, IsNumber, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { PriceAdjustmentType } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

import { ProductDto } from './product.dto';
import { NailShapeDto } from './nail-shape.dto';

export class ProductShapePricingDto extends AbstractDTO {
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
  @IsNumber({ maxDecimalPlaces: 2 })
  priceOverride?: number | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  priceAdjustment?: number | null;

  @IsOptional()
  @IsEnum(PriceAdjustmentType)
  adjustmentType?: PriceAdjustmentType | null;

  @IsBoolean()
  isEnabled: boolean;
}
