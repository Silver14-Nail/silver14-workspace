import { IsEnum, IsOptional, IsString, Length, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { CardBrand, CardProcessor } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

import { PaymentDto } from './payment.dto';

export class CardDetailDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment?: PaymentDto;

  @IsEnum(CardProcessor)
  processor: CardProcessor;

  @IsString()
  @Length(4, 4)
  last4: string;

  @IsEnum(CardBrand)
  brand: CardBrand;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  authCode?: string | null;

  @IsString()
  @Length(1, 100)
  chargeId: string;
}
