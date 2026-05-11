import { Controller, Get, Post } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('config')
  getConfig() {
    const { password: _password, ...safeConfig } =
      this.databaseService.getConfig();

    return safeConfig;
  }

  @Get('status')
  getStatus() {
    return this.databaseService.getConnectionState();
  }

  @Post('open')
  openConnection() {
    return this.databaseService.openConnection();
  }
}
