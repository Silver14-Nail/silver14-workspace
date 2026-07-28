import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { UserApiMiddleware } from './client-api.middleware';
import { AuthModule } from '../../shared/auth/auth.module';
import { ClientAuthModule } from './auth/auth.module';
import { ClientPaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ClientProductsModule } from './products/products.module';
import { ClientWholesalesModule } from './wholesales/wholesales.module';
import { ClientCartModule } from './cart/cart.module';
import { ClientCheckoutModule } from './checkout/checkout.module';
import { ClientUserModule } from './user/user.module';
import { ClientOrdersModule } from './orders/orders.module';
import { ClientCouponsModule } from './coupons/client-coupons.module';
import { ClientCollectionsModule } from './collections/client-collections.module';
import { ClientCurrencyModule } from './currency/currency.module';
import { ClientSuppliesModule } from './supplies/supplies.module';
import { ClientMarketingModule } from './marketing/client-marketing.module';
import { PaymentsSharedModule } from '../../shared/payments/payments-shared.module';

const clientModules = [
  ClientAuthModule,
  ClientProductsModule,
  ClientWholesalesModule,
  ClientPaymentsModule,
  WebhooksModule,
  ClientCartModule,
  ClientCheckoutModule,
  ClientUserModule,
  ClientOrdersModule,
  ClientCouponsModule,
  ClientCollectionsModule,
  ClientCurrencyModule,
  ClientSuppliesModule,
  ClientMarketingModule,
  PaymentsSharedModule,
];

@Module({
  imports: [
    RouterModule.register(clientModules.map((module) => ({ path: 'client-api', module }))),
    AuthModule,
    ...clientModules,
  ],
})
export class ClientApiModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserApiMiddleware)
      .exclude(
        // Webhooks are called by payment gateways — no user token
        { path: 'client-api/webhooks/stripe', method: RequestMethod.POST },
        { path: 'client-api/webhooks/paypal', method: RequestMethod.POST },
        // OnePAY IPN + return — called by OnePAY servers (HMAC-SHA256 verified)
        { path: 'client-api/webhooks/onepay/ipn', method: RequestMethod.GET },
        { path: 'client-api/webhooks/onepay/ipn', method: RequestMethod.POST },
        { path: 'client-api/webhooks/onepay/return', method: RequestMethod.GET },
      )
      .forRoutes({ path: 'client-api', method: RequestMethod.ALL });
  }
}
