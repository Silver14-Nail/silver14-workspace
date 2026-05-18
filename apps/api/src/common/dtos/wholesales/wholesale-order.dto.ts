import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { WholesalePaymentStatus, WholesalePaymentTerms } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { OrderDto } from '../orders/order.dto';
import { WholesaleAccountDto } from './wholesale-account.dto';

export class WholesaleOrderDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WholesaleAccountDto)
  account?: WholesaleAccountDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderDto)
  order?: OrderDto;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  poNumber?: string | null;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  wholesaleDiscount: number;

  @IsEnum(WholesalePaymentTerms)
  paymentTerms: WholesalePaymentTerms;

  @IsEnum(WholesalePaymentStatus)
  paymentStatus: WholesalePaymentStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: Date | null;
}
