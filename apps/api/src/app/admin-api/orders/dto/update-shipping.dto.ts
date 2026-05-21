import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateShippingDto {
  @ApiPropertyOptional({ description: 'Shipping carrier name (e.g. DHL, FedEx, UPS)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carrier?: string | null;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  trackingNumber?: string | null;
}
