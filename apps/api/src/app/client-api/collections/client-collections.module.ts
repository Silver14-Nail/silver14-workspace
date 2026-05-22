import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionEntity } from '@/db/entities/products/collection.entity';
import { ProductEntity } from '@/db/entities/products/product.entity';
import { CollectionTranslationEntity } from '@/db/entities/products/collection-translation.entity';
import { ProductTranslationEntity } from '@/db/entities/products/product-translation.entity';

import { ClientCollectionsService } from './client-collections.service';
import { ClientCollectionsController } from './client-collections.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollectionEntity,
      ProductEntity,
      CollectionTranslationEntity,
      ProductTranslationEntity,
    ]),
  ],
  providers: [ClientCollectionsService],
  controllers: [ClientCollectionsController],
})
export class ClientCollectionsModule {}
