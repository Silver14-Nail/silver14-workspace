import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  Min,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomMeasurementsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() thumb?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() index?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() middle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ring?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pinky?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCustomSize?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomMeasurementsDto)
  customMeasurements?: CustomMeasurementsDto;
}
