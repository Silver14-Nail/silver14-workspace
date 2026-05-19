import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CartItemEntity } from '@/db/entities/checkouts/cart-item.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import { AuthModule } from '@/shared/auth/auth.module';

import { ClientCartService } from './cart.service';
import { ClientCartController } from './cart.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity, ProductVariantEntity]),
    AuthModule,
  ],
  providers: [ClientCartService],
  controllers: [ClientCartController],
  exports: [ClientCartService],
})
export class ClientCartModule {}
