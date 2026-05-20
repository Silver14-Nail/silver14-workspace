import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import type { EnvConfiguration } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const globalPrefix = 'api';

  const configService = app.get<ConfigService<EnvConfiguration>>(ConfigService);
  const port = configService.getOrThrow<number>('port');
  const corsOrigins = configService.get<string[]>('corsOrigin');

  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: corsOrigins ?? true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(port);
  Logger.log(`API is running on http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
