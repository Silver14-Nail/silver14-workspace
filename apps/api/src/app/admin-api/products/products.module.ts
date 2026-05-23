import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { R2SharedModule } from '@/shared/r2/r2.module';

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
  ProductTranslationsController,
} from './products.controller';
import { NailVariantStrategy } from './strategies/nail-variant.strategy';
import { ColorVariantStrategy } from './strategies/color-variant.strategy';

@Module({
  imports: [
    R2SharedModule,
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
    ProductTranslationsController,
  ],
  providers: [ProductsService, NailVariantStrategy, ColorVariantStrategy],
  exports: [ProductsService],
})
export class ProductsModule {}
