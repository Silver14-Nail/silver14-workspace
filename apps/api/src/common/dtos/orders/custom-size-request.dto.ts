import { IsOptional, IsString, Length, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { OrderItemDto } from './order-item.dto';

export class CustomSizeRequestDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderItemDto)
  orderItem?: OrderItemDto;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  thumb?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  indexFinger?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  middleFinger?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  ringFinger?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  pinky?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
