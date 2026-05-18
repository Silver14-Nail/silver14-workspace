import { IsEmail, IsPhoneNumber, IsString, Length, IsUUID } from 'class-validator';

import { AbstractDTO } from '../abstract.dto';

export class GuestCheckoutDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsPhoneNumber()
  @Length(1, 20)
  phone: string;

  @IsString()
  @Length(1, 255)
  trackingToken: string;
}
