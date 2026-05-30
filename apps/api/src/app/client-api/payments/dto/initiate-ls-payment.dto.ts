import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class InitiateLsPaymentDto {
  @ApiProperty({ description: 'ID of the checkout session to pay for' })
  @IsUUID()
  checkoutSessionId: string;

  @ApiProperty({ description: 'URL to redirect to after payment completes' })
  @IsString()
  redirectUrl: string;
}
