import { Transform } from 'class-transformer';
import { IsString, IsUUID, Length } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  @Length(1, 50)
  @Transform(({ value }: { value: string }) => value?.toUpperCase()?.trim())
  code: string;

  @IsUUID()
  cartId: string;
}
