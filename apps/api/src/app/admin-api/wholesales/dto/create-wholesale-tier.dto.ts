import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { WholesaleTierName } from '@/common/enums/entity.enum';

export class CreateWholesaleTierDto {
  @ApiProperty({ enum: WholesaleTierName })
  @IsEnum(WholesaleTierName)
  name: WholesaleTierName;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPercent: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxDiscountAmount?: number | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minMonthlyQty?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderAmount?: number;
}
