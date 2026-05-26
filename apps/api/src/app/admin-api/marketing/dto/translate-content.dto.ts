import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsObject, IsString } from 'class-validator';

export class TranslateContentDto {
  @ApiProperty({ description: 'Map of field name to text value' })
  @IsObject()
  texts: Record<string, string>;

  @ApiProperty({ enum: ['en', 'vi'] })
  @IsString()
  @IsIn(['en', 'vi'])
  from: 'en' | 'vi';

  @ApiProperty({ enum: ['en', 'vi'] })
  @IsString()
  @IsIn(['en', 'vi'])
  to: 'en' | 'vi';
}
