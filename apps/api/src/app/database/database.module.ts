import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { EnvConfiguration } from '@/config/configuration';
import stripeConfig from '@/config/stripe.config';
import lemonSqueezyConfig from '@/config/lemon-squeezy.config';
import paypalConfig from '@/config/paypal.config';
import airwallexConfig from '@/config/airwallex.config';
import twocheckoutConfig from '@/config/twocheckout.config';
import nganluongConfig from '@/config/nganluong.config';
import onepayConfig from '@/config/onepay.config';

import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

import { ENTITIES } from '@/db/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load order: environment-specific overrides first, then base .env
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`, '.env'],
      load: [
        configuration,
        stripeConfig,
        lemonSqueezyConfig,
        paypalConfig,
        airwallexConfig,
        twocheckoutConfig,
        nganluongConfig,
        onepayConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfiguration>) => {
        return {
          type: configService.get('databaseType') as any,
          host: configService.get('databaseHost'),
          port: configService.get('mysqlPort'),
          username: configService.get('mysqlUser'),
          password: configService.get('mysqlPassword'),
          database: configService.get<string>('mysqlDatabase'),
          autoLoadEntities: true,
          entities: ENTITIES,
          synchronize: false,
          ssl: {
            rejectUnauthorized: false,
          },
          connectorPackage: 'mysql2',
          // Serverless: each function instance has its own pool, so keep the pool
          // at 1 to avoid exhausting the DB's max_connections across many instances.
          extra: {
            connectionLimit: 1,
            waitForConnections: true,
            queueLimit: 0,
            acquireTimeout: 10000,
          },
        };
      },
    }),
  ],
  controllers: [DatabaseController],
  exports: [DatabaseService],
  providers: [DatabaseService],
})
export class DatabaseModule {}
