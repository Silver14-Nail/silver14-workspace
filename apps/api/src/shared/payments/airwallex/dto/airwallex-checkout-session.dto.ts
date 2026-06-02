import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AirwallexCreateCheckoutSessionDto {
  @ApiProperty({ description: 'Checkout session ID' })
  @IsString()
  checkoutSessionId: string;

  @ApiProperty({ description: 'Return URL after payment completes' })
  @IsString()
  returnUrl: string;

  @ApiPropertyOptional({ description: 'Cancel URL' })
  @IsOptional()
  @IsString()
  cancelUrl?: string;

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

  @ApiPropertyOptional({ description: 'Customer info for new customer creation' })
  @IsOptional()
  @IsObject()
  customer?: {
    merchantCustomerId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}
