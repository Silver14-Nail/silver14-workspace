import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum ProductSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export enum ProductFilterBy {
  NEW = 'new',
  BEST_SELLER = 'bestseller',
}

export class ProductQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by product name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by nail shape ID' })
  @IsOptional()
  @IsUUID()
  shapeId?: string;

  @ApiPropertyOptional({ description: 'Filter by collection slug' })
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional({ description: 'Minimum base price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum base price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    enum: ProductSortBy,
    description: 'Sort order: newest | oldest | price_asc | price_desc | name_asc | name_desc',
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy;

  @ApiPropertyOptional({
    enum: ProductFilterBy,
    description: 'Filter: new | bestseller',
  })
  @IsOptional()
  @IsEnum(ProductFilterBy)
  filterBy?: ProductFilterBy;
}
