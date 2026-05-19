import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

import { NewsletterSource } from '@/common/enums/entity.enum';

export class SubscribeNewsletterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: NewsletterSource, default: NewsletterSource.FOOTER })
  @IsOptional()
  @IsEnum(NewsletterSource)
  source?: NewsletterSource;
}
