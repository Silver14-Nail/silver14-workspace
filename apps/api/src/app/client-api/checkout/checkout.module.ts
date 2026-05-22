import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartEntity } from '@/db/entities/checkouts/cart.entity';
import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { ShippingMethodEntity } from '@/db/entities/checkouts/shipping-method.entity';
import { CouponEntity } from '@/db/entities/coupons/coupon.entity';
import { CouponUsageEntity } from '@/db/entities/coupons/coupon-usage.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { AuthModule } from '@/shared/auth/auth.module';
import { CurrencySharedModule } from '@/shared/currency/currency.module';

import { ClientCheckoutService } from './checkout.service';
import { ClientCheckoutController } from './checkout.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartEntity,
      CheckoutSessionEntity,
      ShippingMethodEntity,
      CouponEntity,
      CouponUsageEntity,
      OrderEntity,
    ]),
    AuthModule,
    CurrencySharedModule,
  ],
  providers: [ClientCheckoutService],
  controllers: [ClientCheckoutController],
})
export class ClientCheckoutModule {}
