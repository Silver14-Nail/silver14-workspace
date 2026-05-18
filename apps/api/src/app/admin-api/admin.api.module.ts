import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RouterModule } from 'nest-router';

import { AdminApiMiddleware } from './admin-api.middleware';
import { AuthModule } from '../../shared/auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AdminAuthModule } from './auth/auth.module';
import { AdminUsersModule } from './users/users.module';
import { WholesalesModule } from './wholesales/wholesales.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    RouterModule.forRoutes(
      [ProductsModule, AdminAuthModule, AdminUsersModule, WholesalesModule, OrdersModule, CouponsModule].map(
        (module) => ({ path: 'admin-api', module }),
      ),
    ),
    AuthModule,
    ProductsModule,
    AdminAuthModule,
    AdminUsersModule,
    WholesalesModule,
    OrdersModule,
    CouponsModule,
  ],
})
export class AdminApiModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminApiMiddleware)
      .exclude(
        { path: 'admin-api/auth/login', method: RequestMethod.POST },
        { path: 'admin-api/auth/refresh', method: RequestMethod.POST },
      )
      .forRoutes({ path: 'admin-api', method: RequestMethod.ALL });
  }
}
