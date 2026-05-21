import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaymentStatus } from '@/common/enums/entity.enum';

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({ description: 'Admin note for the status change' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
