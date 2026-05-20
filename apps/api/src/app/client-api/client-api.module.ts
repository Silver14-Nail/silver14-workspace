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

const clientModules = [
  ClientAuthModule,
  ClientProductsModule,
  ClientWholesalesModule,
  ClientPaymentsModule,
  WebhooksModule,
  ClientCartModule,
  ClientCheckoutModule,
  ClientUserModule,
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
        // Webhooks are called by Stripe/PayPal — no user token
        { path: 'client-api/webhooks/stripe', method: RequestMethod.POST },
        { path: 'client-api/webhooks/paypal', method: RequestMethod.POST },
      )
      .forRoutes({ path: 'client-api', method: RequestMethod.ALL });
  }
}
