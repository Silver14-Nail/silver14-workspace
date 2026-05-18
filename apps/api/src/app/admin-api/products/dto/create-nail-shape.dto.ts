import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateNailShapeDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  lengthMm: number;

  @ApiPropertyOptional({ enum: ShapeSizeTier, default: ShapeSizeTier.STANDARD })
  @IsOptional()
  @IsEnum(ShapeSizeTier)
  sizeTier?: ShapeSizeTier;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceAdjustment?: number;

  @ApiPropertyOptional({ enum: PriceAdjustmentType, default: PriceAdjustmentType.FIXED })
  @IsOptional()
  @IsEnum(PriceAdjustmentType)
  adjustmentType?: PriceAdjustmentType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
