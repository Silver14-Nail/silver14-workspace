import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min } from 'class-validator';

export class UpdateVariantDto {
  @IsOptional()
  @IsUUID()
  shapeId?: string;

  @IsOptional()
  @IsUUID()
  sizeId?: string;

  @IsOptional()
  @IsString()
  sku?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  computedPrice?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
