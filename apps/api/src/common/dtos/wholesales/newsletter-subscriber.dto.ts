import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { NewsletterSource, NewsletterStatus } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from '../auths/user.dto';

export class NewsletterSubscriberDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto | null;

  @IsEnum(NewsletterStatus)
  status: NewsletterStatus;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, boolean> | null;

  @IsEnum(NewsletterSource)
  source: NewsletterSource;

  @IsOptional()
  @IsDateString()
  unsubscribedAt?: Date | null;
}
