import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

import { PriceAdjustmentType, ShapeSizeTier } from '@/common/enums/entity.enum';

export class UpdateNailShapeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  lengthMm?: number;

  @ApiPropertyOptional({ enum: ShapeSizeTier })
  @IsOptional()
  @IsEnum(ShapeSizeTier)
  sizeTier?: ShapeSizeTier;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceAdjustment?: number;

  @ApiPropertyOptional({ enum: PriceAdjustmentType })
  @IsOptional()
  @IsEnum(PriceAdjustmentType)
  adjustmentType?: PriceAdjustmentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
