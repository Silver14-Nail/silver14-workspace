import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class UpdateContactDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  fullName: string;
}
