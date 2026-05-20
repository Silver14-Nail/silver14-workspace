import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';
import { ProductImageEntity } from '@/db/entities/products/product-image.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';

import { ProductsService } from './products.service';
import {
  NailShapesController,
  NailSizesController,
  ProductsController,
  ProductImagesController,
  ProductVariantsController,
} from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      NailShapeEntity,
      NailSizeEntity,
      ProductImageEntity,
      ProductVariantEntity,
    ]),
  ],
  controllers: [
    ProductsController,
    NailShapesController,
    NailSizesController,
    ProductImagesController,
    ProductVariantsController,
  ],
  providers: [ProductsService],
})
export class ProductsModule {}
