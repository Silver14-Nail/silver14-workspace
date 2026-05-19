import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';

import { ClientProductsService } from './products.service';
import { ClientProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, NailShapeEntity, NailSizeEntity])],
  providers: [ClientProductsService],
  controllers: [ClientProductsController],
})
export class ClientProductsModule {}
