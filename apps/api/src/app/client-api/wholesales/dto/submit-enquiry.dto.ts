import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class SubmitEnquiryDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  businessType?: string;

  @ApiPropertyOptional({ description: 'e.g. "100-500"' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  monthlyOrderQtyRange?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collectionsOfInterest?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalMessage?: string;
}
