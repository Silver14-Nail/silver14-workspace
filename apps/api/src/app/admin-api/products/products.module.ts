import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';

import { ProductsService } from './products.service';
import {
  NailShapesController,
  NailSizesController,
  ProductsController,
} from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, NailShapeEntity, NailSizeEntity])],
  controllers: [ProductsController, NailShapesController, NailSizesController],
  providers: [ProductsService],
})
export class ProductsModule {}
