import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { EnvConfiguration } from '@/config/configuration';
import stripeConfig from '@/config/stripe.config';
import paypalConfig from '@/config/paypal.config';
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
      load: [configuration, stripeConfig, paypalConfig, onepayConfig],
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
          // A single long-running process now (Docker, not serverless
          // functions) — connectionLimit: 1 used to be deliberate (each
          // Vercel function instance got its own pool, so a bigger limit
          // risked exhausting Aiven's max_connections across many
          // concurrent instances). That constraint doesn't apply here: one
          // process serves all requests, and a pool of 1 meant every
          // concurrent query — e.g. multiple infinite-scroll "load more"
          // requests — queued behind a single connection. The shared
          // MySQL's max_connections is 151 with ~12 in use; 10 leaves
          // plenty of headroom for the other apps on this server.
          extra: {
            connectionLimit: 10,
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
