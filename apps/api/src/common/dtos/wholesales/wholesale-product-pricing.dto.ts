import { IsBoolean, IsNumber, IsOptional, Min, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { ProductDto } from '../products/product.dto';
import { WholesaleAccountDto } from './wholesale-account.dto';

export class WholesaleProductPricingDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WholesaleAccountDto)
  account?: WholesaleAccountDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDto)
  product?: ProductDto;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  overridePrice?: number | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPercent?: number | null;

  @IsBoolean()
  isEnabled: boolean;
}
