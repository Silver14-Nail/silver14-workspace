import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  IsUUID,
} from 'class-validator';

import { AbstractDTO } from '../abstract.dto';

export class ShippingMethodDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  carrier?: string | null;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  fee?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  estDaysMin?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  estDaysMax?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
