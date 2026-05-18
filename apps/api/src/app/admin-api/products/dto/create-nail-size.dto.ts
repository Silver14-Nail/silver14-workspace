import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { NailSizeLabel } from '@/common/enums/entity.enum';

export class CreateNailSizeDto {
  @ApiProperty({ enum: NailSizeLabel })
  @IsEnum(NailSizeLabel)
  label: NailSizeLabel;

  @ApiProperty()
  @IsString()
  @Length(1, 20)
  sizeCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  measurements?: string;
}
