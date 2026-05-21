import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionEntity } from '@/db/entities/products/collection.entity';
import { ProductEntity } from '@/db/entities/products/product.entity';

import { ClientCollectionsService } from './client-collections.service';
import { ClientCollectionsController } from './client-collections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionEntity, ProductEntity])],
  providers: [ClientCollectionsService],
  controllers: [ClientCollectionsController],
})
export class ClientCollectionsModule {}
