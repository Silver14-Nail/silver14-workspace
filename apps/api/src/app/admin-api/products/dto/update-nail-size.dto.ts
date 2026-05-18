import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { NailSizeLabel } from '@/common/enums/entity.enum';

export class UpdateNailSizeDto {
  @ApiPropertyOptional({ enum: NailSizeLabel })
  @IsOptional()
  @IsEnum(NailSizeLabel)
  label?: NailSizeLabel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  sizeCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  measurements?: string | null;
}
