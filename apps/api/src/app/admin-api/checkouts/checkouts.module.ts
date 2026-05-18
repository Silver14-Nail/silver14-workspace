import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShippingMethodEntity } from '@/db/entities/checkouts/shipping-method.entity';
import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';

import { CheckoutsService } from './checkouts.service';
import {
  ShippingMethodsController,
  CartsController,
  CheckoutSessionsController,
} from './checkouts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethodEntity, CartEntity, CheckoutSessionEntity])],
  providers: [CheckoutsService],
  controllers: [ShippingMethodsController, CartsController, CheckoutSessionsController],
})
export class CheckoutsModule {}
