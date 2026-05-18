import { IsInt, IsUrl, IsUUID } from 'class-validator';

import { AbstractDTO } from '../abstract.dto';

export class ProductImageDto extends AbstractDTO {
  @IsUUID()
  id: string;

  @IsUrl()
  url: string;

  @IsInt()
  sortOrder: number;
}
