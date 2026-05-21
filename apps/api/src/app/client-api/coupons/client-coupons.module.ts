import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CartEntity } from '@/db/entities/checkouts/cart.entity';

import { ClientCouponsService } from './client-coupons.service';
import { ClientCouponsController } from './client-coupons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity, CartEntity])],
  providers: [ClientCouponsService],
  controllers: [ClientCouponsController],
})
export class ClientCouponsModule {}
