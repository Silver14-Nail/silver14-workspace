import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { version } from '../../../package.json';
import { AuthModule } from '../../shared/auth/auth.module';
import { ClientProductsModule } from './products/products.module';
import { ClientPaymentsModule } from './payments/payments.module';
import { ClientWholesalesModule } from './wholesales/wholesales.module';
import { ClientCartModule } from './cart/cart.module';
import { ClientCheckoutModule } from './checkout/checkout.module';
import { ClientUserModule } from './user/user.module';

export const setupClientApiSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('USER API SWAGGER')
    .setDescription('description')
    .setVersion(version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [
      AuthModule,
      ClientProductsModule,
      ClientPaymentsModule,
      ClientWholesalesModule,
      ClientCartModule,
      ClientCheckoutModule,
      ClientUserModule,
    ],
  });

  SwaggerModule.setup('client-api/doc', app, document);
};
