import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

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

  @ApiProperty({ example: '+84364589229 or 0364589229' })
  @IsString()
  @Matches(/^[+\d][\d\s\-().]{5,29}$/, { message: 'phone must be a valid phone number' })
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
