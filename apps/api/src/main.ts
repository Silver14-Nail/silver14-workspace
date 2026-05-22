import 'reflect-metadata';

import { BadRequestException, INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app/app.module';
import type { EnvConfiguration } from './config/configuration';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

const logger = new Logger('Bootstrap');
const expressApp = express();
let nestApp: INestApplication | null = null;

// ── Process-level crash protection ────────────────────────────────────────────

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception — process will exit', error.stack);
  // Allow PM2 / Docker restart: exit so the supervisor can bring it back up.
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(
    'Unhandled Promise Rejection',
    reason instanceof Error ? reason.stack : String(reason),
  );
  // Do not exit: unhandled rejections are often non-fatal in NestJS services,
  // but log them so they surface in production monitoring.
});

process.on('warning', (warning) => {
  logger.warn(`Node Warning [${warning.name}]: ${warning.message}`);
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<INestApplication> {
  if (nestApp) return nestApp;

  nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    rawBody: true,
    logger: ['error', 'warn', 'log', 'debug'],
  });

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
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((e) => Object.values(e.constraints ?? {})).join('; ');
        return new BadRequestException(messages || 'Validation failed');
      },
    }),
  );

  nestApp.useGlobalFilters(new GlobalExceptionFilter());
  nestApp.useGlobalInterceptors(new LoggingInterceptor());

  await nestApp.init();
  return nestApp;
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function gracefulShutdown(signal: string): Promise<void> {
  logger.log(`Received ${signal} — initiating graceful shutdown`);
  try {
    if (nestApp) {
      await nestApp.close();
      logger.log('NestJS application closed cleanly');
    }
  } catch (err) {
    logger.error('Error during graceful shutdown', err instanceof Error ? err.stack : String(err));
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Vercel serverless handler ─────────────────────────────────────────────────

module.exports = async (req: any, res: any) => {
  try {
    await bootstrap();
  } catch (err) {
    logger.error(
      'Bootstrap failed in serverless handler',
      err instanceof Error ? err.stack : String(err),
    );
    res
      .status(500)
      .json({ success: false, message: 'Service unavailable', errorCode: 'BOOTSTRAP_FAILED' });
    return;
  }
  expressApp(req, res);
};

// ── Local development ─────────────────────────────────────────────────────────

if (!process.env.VERCEL) {
  bootstrap()
    .then((app) => {
      const configService = app.get<ConfigService<EnvConfiguration>>(ConfigService);
      const port = configService.getOrThrow<number>('port');
      expressApp.listen(port, () => {
        logger.log(`API is running on http://localhost:${port}/api`);
        logger.log(`Health check: http://localhost:${port}/api/health`);
        logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
      });
    })
    .catch((err: Error) => {
      logger.error('Fatal: bootstrap failed', err.stack);
      process.exit(1);
    });
}
