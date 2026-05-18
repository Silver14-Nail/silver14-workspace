import { IsBoolean, IsEnum, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

import { WholesaleTierName } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

export class WholesaleTierDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsEnum(WholesaleTierName)
  name: WholesaleTierName;

  @IsNumber()
  @Min(0)
  minMonthlyQty: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPercent: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxDiscountAmount?: number | null;

  @IsBoolean()
  freeShipping: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderAmount: number;
}
