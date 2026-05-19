import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ApplyCouponDto {
  @ApiProperty({ example: 'SAVE10' })
  @Transform(({ value }) => String(value).toUpperCase().trim())
  @IsString()
  @MaxLength(50)
  code: string;
}
