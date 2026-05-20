import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min } from 'class-validator';

export class CreateVariantDto {
  @IsUUID()
  shapeId: string;

  @IsUUID()
  sizeId: string;

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
  @IsBoolean()
  isAvailable?: boolean;
}
