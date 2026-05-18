import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../shared/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AdminApiModule } from './admin-api/admin.api.module';

@Module({
  imports: [AuthModule, DatabaseModule, AdminApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
