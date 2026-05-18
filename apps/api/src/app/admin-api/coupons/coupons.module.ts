import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponRestrictionEntity } from '@/db/entities/coupons/coupon-restriction.entity';

import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity, CouponRestrictionEntity])],
  providers: [CouponsService],
  controllers: [CouponsController],
})
export class CouponsModule {}
