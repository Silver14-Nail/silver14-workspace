import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { version } from '../../../package.json';
import { AuthModule } from '../../shared/auth/auth.module';

export const setupClientApiSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('USER API SWAGGER')
    .setDescription('description')
    .setVersion(version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [AuthModule],
  });

  SwaggerModule.setup('client-api/doc', app, document);
};
