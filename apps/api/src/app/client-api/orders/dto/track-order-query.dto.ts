import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TrackOrderQueryDto {
  @ApiProperty({ description: 'Order UUID' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Phone number used at checkout' })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
