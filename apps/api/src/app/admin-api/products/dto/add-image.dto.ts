import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class AddImageDto {
  @IsString()
  @IsUrl({ require_tld: false })
  url: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
