import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from '@/db/entities/orders/order.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, PaymentEntity])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
