import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RouterModule } from 'nest-router';

import { AdminApiMiddleware } from './admin-api.midleware';
import { AuthModule } from '../../shared/auth/auth.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    RouterModule.forRoutes(
      [ProductsModule].map((module) => ({
        path: 'admin-api',
        module,
      })),
    ),
    AuthModule,
    ProductsModule,
  ],
})
export class AdminApiModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminApiMiddleware).forRoutes({ path: 'admin-api', method: RequestMethod.ALL });
  }
}
