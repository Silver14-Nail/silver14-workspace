import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { WholesaleEnquiryStatus } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from '../auths/user.dto';
import { WholesaleAccountDto } from './wholesale-account.dto';

export class WholesaleEnquiryDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @Length(1, 100)
  country: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  businessName?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  businessType?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  monthlyOrderQtyRange?: string | null;

  @IsOptional()
  @IsArray()
  collectionsOfInterest?: string[] | null;

  @IsOptional()
  @IsString()
  additionalMessage?: string | null;

  @IsEnum(WholesaleEnquiryStatus)
  status: WholesaleEnquiryStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  handledBy?: UserDto | null;

  @IsOptional()
  @IsString()
  adminNotes?: string | null;

  @IsOptional()
  @IsDateString()
  respondedAt?: Date | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => WholesaleAccountDto)
  account?: WholesaleAccountDto;
}
