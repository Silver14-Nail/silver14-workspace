import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Active cart ID to convert to a checkout session' })
  @IsUUID()
  cartId: string;
}
