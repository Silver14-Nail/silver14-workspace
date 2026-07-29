import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SupportedCurrency } from '@/common/enums/entity.enum';
import { AddCartItemDto } from '../../cart/dto/add-cart-item.dto';

// Combines cart sync + session creation + contact save into one request —
// the three calls a fresh checkout always needs in sequence, previously
// three separate round-trips.
export class StartCheckoutDto {
  @ApiProperty({ type: [AddCartItemDto] })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AddCartItemDto)
  items: AddCartItemDto[];

  @ApiPropertyOptional({
    description: 'Currency for this checkout session (USD or EUR)',
    enum: SupportedCurrency,
    default: SupportedCurrency.USD,
  })
  @IsOptional()
  @IsIn([SupportedCurrency.USD, SupportedCurrency.EUR])
  currency?: string;

  @ApiProperty()
  @IsEmail()
  contactEmail: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  contactPhone: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  contactFullName: string;
}
