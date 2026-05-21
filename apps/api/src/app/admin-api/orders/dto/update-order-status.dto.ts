import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { OrderStatus } from '@/common/enums/entity.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Reason for status change (stored in internal notes)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
