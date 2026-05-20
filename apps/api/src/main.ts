import 'reflect-metadata';

import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app/app.module';
import type { EnvConfiguration } from './config/configuration';

const expressApp = express();
let nestApp: INestApplication | null = null;

async function bootstrap(): Promise<INestApplication> {
  if (nestApp) return nestApp;

  nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { rawBody: true });

  const configService = nestApp.get<ConfigService<EnvConfiguration>>(ConfigService);
  const corsOrigins = configService.get<string[]>('corsOrigin');

  nestApp.use(cookieParser());
  nestApp.setGlobalPrefix('api');
  nestApp.enableCors({
    origin: corsOrigins ?? true,
    credentials: true,
  });
  nestApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await nestApp.init();
  return nestApp;
}

// Vercel serverless handler
module.exports = async (req: any, res: any) => {
  await bootstrap();
  expressApp(req, res);
};

// Local development
if (!process.env.VERCEL) {
  bootstrap().then((app) => {
    const configService = app.get<ConfigService<EnvConfiguration>>(ConfigService);
    const port = configService.getOrThrow<number>('port');
    expressApp.listen(port, () => {
      Logger.log(`API is running on http://localhost:${port}/api`);
    });
  });
}
