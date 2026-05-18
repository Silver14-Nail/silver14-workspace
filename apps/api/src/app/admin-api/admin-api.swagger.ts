import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { version } from '../../../package.json';
import { AuthModule } from '../../shared/auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AdminAuthModule } from './auth/auth.module';
import { AdminUsersModule } from './users/users.module';
import { WholesalesModule } from './wholesales/wholesales.module';
import { OrdersModule } from './orders/orders.module';

export const setupAdminApiSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('ADMIN API SWAGGER')
    .setDescription('description')
    .setVersion(version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [
      AuthModule,
      ProductsModule,
      AdminAuthModule,
      AdminUsersModule,
      WholesalesModule,
      OrdersModule,
    ],
  });

  SwaggerModule.setup('admin-api/doc', app, document);
};
