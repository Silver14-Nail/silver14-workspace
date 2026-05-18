import { IsBoolean, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { AbstractDTO } from '../abstract.dto';

import { UserDto } from './user.dto';

export class AddressDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto | null;

  @IsString()
  @Length(1, 100)
  recipientName: string;

  @IsString()
  @Length(1, 255)
  street: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(1, 100)
  country: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
