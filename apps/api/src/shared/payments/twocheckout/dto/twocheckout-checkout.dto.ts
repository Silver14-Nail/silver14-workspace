import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TwocheckoutCheckoutDto {
  @ApiProperty({ description: 'Checkout session ID' })
  @IsString()
  checkoutSessionId: string;

  @ApiProperty({ description: 'URL to redirect after successful payment' })
  @IsUrl({ require_tld: false })
  returnUrl: string;

  @ApiPropertyOptional({ description: 'URL to redirect if customer cancels' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;
}
