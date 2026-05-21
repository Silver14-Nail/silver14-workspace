import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponRestrictionEntity } from '@/db/entities/coupons/coupon-restriction.entity';
import { CouponUserWhitelistEntity } from '@/db/entities/coupons/coupon-user-whitelist.entity';
import { CouponUsageEntity } from '@/db/entities/coupons/coupon-usage.entity';
import { UserEntity } from '@/db/entities/auths/user.entity';

import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CouponRestrictionEntity,
      CouponUserWhitelistEntity,
      CouponUsageEntity,
      UserEntity,
    ]),
  ],
  providers: [CouponsService],
  controllers: [CouponsController],
})
export class CouponsModule {}
