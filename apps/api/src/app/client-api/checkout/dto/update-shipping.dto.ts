import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateShippingDto {
  @ApiProperty({ description: 'Shipping method ID' })
  @IsUUID()
  shippingMethodId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  recipientName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}
