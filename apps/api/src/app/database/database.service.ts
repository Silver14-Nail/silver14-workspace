import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { DatabaseConnectionState } from './database.types';

@Injectable()
export class DatabaseService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getConnectionState(): DatabaseConnectionState {
    const options = this.dataSource.options as any;

    return {
      connected: this.dataSource.isInitialized,
      database: options.database || 'not-configured',
      host: options.host || 'not-configured',
      port: options.port,
      provider: options.type,
      ssl: !!options.ssl,
      reason: this.dataSource.isInitialized ? undefined : 'Database driver is not initialized',
    };
  }

  async openConnection(): Promise<DatabaseConnectionState> {
    if (!this.dataSource.isInitialized) {
      try {
        await this.dataSource.initialize();
      } catch (error) {
        const state = this.getConnectionState();
        state.reason = error.message;
        return state;
      }
    }

    return this.getConnectionState();
  }
}
