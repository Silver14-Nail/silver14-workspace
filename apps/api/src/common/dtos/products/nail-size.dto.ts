import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { NailSizeLabel } from '../../../common/enums/entity.enum';

import { AbstractDTO } from '../abstract.dto';

export class NailSizeDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsEnum(NailSizeLabel)
  label: NailSizeLabel;

  @IsString()
  sizeCode: string;

  @IsOptional()
  @IsString()
  measurements?: string | null;
}
