import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateShippingFeeDto {
  @ApiProperty({ description: 'New shipping fee in order currency (USD)', example: 15 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999)
  shippingFee: number;
}
