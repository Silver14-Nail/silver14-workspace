import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AirwallexConfirmPaymentDto {
  @ApiProperty({ description: 'Airwallex Payment Intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'Checkout session ID' })
  @IsString()
  checkoutSessionId: string;
}
