import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from '@/db/entities/orders/order.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, PaymentEntity, ProductVariantEntity])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
