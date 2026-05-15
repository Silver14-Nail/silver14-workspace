import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { EnvConfiguration } from '@/config/configuration';

import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`],
      load: [configuration],
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
          synchronize: false,
          ssl: {
            rejectUnauthorized: false,
          },
          connectorPackage: 'mysql2',
        };
      },
    }),
  ],
  controllers: [DatabaseController],
  exports: [DatabaseService],
  providers: [DatabaseService],
})
export class DatabaseModule {}
