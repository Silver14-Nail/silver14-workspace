import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { NewsletterStatus } from '@/common/enums/entity.enum';

export class UpdateNewsletterSubscriberDto {
  @ApiPropertyOptional({ enum: NewsletterStatus })
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus;
}
