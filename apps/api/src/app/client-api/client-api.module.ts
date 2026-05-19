import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RouterModule } from 'nest-router';

import { UserApiMiddleware } from './client-api.middleware';
import { AuthModule } from '../../shared/auth/auth.module';
import { ClientPaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ClientProductsModule } from './products/products.module';
import { ClientWholesalesModule } from './wholesales/wholesales.module';
import { ClientCartModule } from './cart/cart.module';
import { ClientCheckoutModule } from './checkout/checkout.module';
import { ClientUserModule } from './user/user.module';

const clientModules = [
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
    RouterModule.forRoutes(clientModules.map((module) => ({ path: 'user-api', module }))),
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
        { path: 'user-api/webhooks/stripe', method: RequestMethod.POST },
        { path: 'user-api/webhooks/paypal', method: RequestMethod.POST },
      )
      .forRoutes({ path: 'user-api', method: RequestMethod.ALL });
  }
}
