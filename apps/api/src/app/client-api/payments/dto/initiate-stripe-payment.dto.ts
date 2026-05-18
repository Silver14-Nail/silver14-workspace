import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class InitiateStripePaymentDto {
  @ApiProperty({ description: 'ID of the checkout session to pay for' })
  @IsUUID()
  checkoutSessionId: string;
}
