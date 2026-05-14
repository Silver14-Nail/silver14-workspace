import { ApiProperty } from '@nestjs/swagger';
import { SoftDeleteAbstractEntity } from '@/common/entities/soft-delete-abstract.entity';

export class SoftDeleteAbstractDTO {
  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt?: string;

  @ApiProperty()
  deletedAt?: string;

  constructor(entity: SoftDeleteAbstractEntity) {
    this.createdAt = entity.createdAt.toISOString();
    this.updatedAt = entity.updatedAt ? entity.updatedAt.toISOString() : undefined;
    this.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : undefined;
  }
}
