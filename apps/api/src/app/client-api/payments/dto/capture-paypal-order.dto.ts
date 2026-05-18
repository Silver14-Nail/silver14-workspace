import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CapturePaypalOrderDto {
  @ApiProperty({ description: 'PayPal order ID returned from createOrder' })
  @IsString()
  paypalOrderId: string;

  @ApiProperty({ description: 'Checkout session ID' })
  @IsUUID()
  checkoutSessionId: string;
}
