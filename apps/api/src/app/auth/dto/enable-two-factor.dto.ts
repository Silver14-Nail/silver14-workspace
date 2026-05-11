import { IsString, MinLength } from 'class-validator';

export class EnableTwoFactorDto {
  @IsString()
  @MinLength(6)
  code!: string;
}
