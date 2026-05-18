import { IsBoolean, IsEnum, IsInt, IsNumber, IsString, Length, IsUUID } from 'class-validator';

import { PriceAdjustmentType, ShapeSizeTier } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

export class NailShapeDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsInt()
  lengthMm: number;

  @IsEnum(ShapeSizeTier)
  sizeTier: ShapeSizeTier;

  @IsNumber({ maxDecimalPlaces: 2 })
  priceAdjustment: number;

  @IsEnum(PriceAdjustmentType)
  adjustmentType: PriceAdjustmentType;

  @IsBoolean()
  isActive: boolean;
}
