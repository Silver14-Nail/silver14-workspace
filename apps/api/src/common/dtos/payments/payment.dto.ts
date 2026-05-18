import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PaymentGateway, PaymentStatus } from '../../../common/enums/entity.enum';

import { SoftDeleteAbstractDTO } from '../soft-delete-abstract.dto';

import { OrderDto } from '../orders/order.dto';
import { PaypalDetailDto } from './paypal-detail.dto';
import { CardDetailDto } from './card-detail.dto';

export class PaymentDto extends SoftDeleteAbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderDto)
  order?: OrderDto;

  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  gatewayTxnId?: string | null;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsOptional()
  @IsObject()
  gatewayResponse?: Record<string, any> | null;

  @IsOptional()
  @IsDateString()
  paidAt?: Date | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaypalDetailDto)
  paypalDetail?: PaypalDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CardDetailDto)
  cardDetail?: CardDetailDto;
}
