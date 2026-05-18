import { IsOptional, IsString, Length, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { PaymentDto } from './payment.dto';

export class PaypalDetailDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment?: PaymentDto;

  @IsString()
  @Length(1, 100)
  paypalOrderId: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  payerEmail?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  payerId?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  captureId?: string | null;
}
