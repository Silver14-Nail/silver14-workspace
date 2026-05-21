import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AdminApiModule } from './admin-api/admin.api.module';
import { ClientApiModule } from './client-api/client-api.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [DatabaseModule, AdminApiModule, ClientApiModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
