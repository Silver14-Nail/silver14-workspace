import { IsString } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;
}
