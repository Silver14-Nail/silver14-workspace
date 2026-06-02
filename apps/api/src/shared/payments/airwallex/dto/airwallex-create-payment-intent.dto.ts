import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AirwallexCreatePaymentIntentDto {
  @ApiProperty({ description: 'Checkout session ID' })
  @IsString()
  checkoutSessionId: string;

  @ApiPropertyOptional({ description: 'Explicit amount override (defaults to session total)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Payment method types to allow',
    example: ['card', 'apple_pay', 'google_pay'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethodTypes?: string[];

  @ApiPropertyOptional({ description: 'If true, allows saving the card for future payments' })
  @IsOptional()
  @IsBoolean()
  allowSaveCard?: boolean;

  @ApiPropertyOptional({ description: 'Customer ID for recurring/saved-card payments' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
