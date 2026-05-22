import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { SupportedCurrency } from '@/common/enums/entity.enum';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Active cart ID to convert to a checkout session' })
  @IsUUID()
  cartId: string;

  @ApiPropertyOptional({
    description: 'Currency for this checkout session (USD or EUR)',
    enum: SupportedCurrency,
    default: SupportedCurrency.USD,
  })
  @IsOptional()
  @IsIn([SupportedCurrency.USD, SupportedCurrency.EUR])
  currency?: string;
}
