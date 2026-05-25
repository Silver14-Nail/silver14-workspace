import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVariantDto {
  @IsOptional()
  @IsUUID()
  shapeId?: string;

  @IsOptional()
  @IsUUID()
  sizeId?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  @Min(0)
  stockQty: number;

  @IsNumber()
  @Min(0)
  computedPrice: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 1 || value === '1' || value === 'true'
    ? true : value === false || value === 0 || value === '0' || value === 'false' ? false : value)
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  colorName?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'colorHex must be a valid hex color (e.g. #FF0000)' })
  colorHex?: string | null;

  @IsOptional()
  @IsString()
  variantImageUrl?: string | null;
}
