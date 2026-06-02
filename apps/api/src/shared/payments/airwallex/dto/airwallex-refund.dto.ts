import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AirwallexRefundDto {
  @ApiProperty({ description: 'Payment ID (our internal ID)' })
  @IsString()
  paymentId: string;

  @ApiPropertyOptional({
    description: 'Amount to refund in smallest currency unit. Omit for full refund.',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ description: 'Reason for the refund' })
  @IsOptional()
  @IsString()
  reason?: string;
}
