import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RouterModule } from 'nest-router';

import { UserApiMiddleware } from './client-api.middleware';
import { AuthModule } from '../../shared/auth/auth.module';
import { ClientPaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';

const clientModules = [ClientPaymentsModule, WebhooksModule];

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
