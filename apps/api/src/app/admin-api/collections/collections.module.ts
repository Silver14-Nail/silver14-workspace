import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionEntity } from '@/db/entities/products/collection.entity';
import { ProductEntity } from '@/db/entities/products/product.entity';
import { R2SharedModule } from '@/shared/r2/r2.module';

import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionEntity, ProductEntity]), R2SharedModule],
  providers: [CollectionsService],
  controllers: [CollectionsController],
})
export class AdminCollectionsModule {}
