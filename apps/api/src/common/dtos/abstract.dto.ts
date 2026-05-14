import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from '@/common/entities/abstract.entity';

export class AbstractDTO {
  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt?: string;

  constructor(entity: AbstractEntity) {
    this.createdAt = entity.createdAt.toISOString();
    this.updatedAt = entity.updatedAt ? entity.updatedAt.toISOString() : undefined;
  }
}
