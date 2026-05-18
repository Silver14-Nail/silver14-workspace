import { IsString, MinLength } from 'class-validator';

export class VerifyTwoFactorDto {
  @IsString()
  challengeId!: string;

  @IsString()
  @MinLength(6)
  code!: string;
}
