import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RouterModule } from 'nest-router';

import { UserApiMiddleware } from './client-api.middleware';
import { AuthModule } from '../../shared/auth/auth.module';

@Module({
  imports: [
    RouterModule.forRoutes(
      [].map((module) => ({
        path: 'user-api',
        module,
      })),
    ),
    AuthModule,
  ],
})
export class ClientApiModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserApiMiddleware).forRoutes({ path: 'user-api', method: RequestMethod.ALL });
  }
}
