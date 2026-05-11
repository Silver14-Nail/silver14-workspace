import { Injectable } from '@nestjs/common';
import { getDatabaseConfig } from './database.config';
import type {
  DatabaseConnectionOptions,
  DatabaseConnectionState,
} from './database.types';

@Injectable()
export class DatabaseService {
  private connectionState: DatabaseConnectionState | null = null;

  getConfig(): DatabaseConnectionOptions {
    return getDatabaseConfig();
  }

  async openConnection(): Promise<DatabaseConnectionState> {
    const config = this.getConfig();
    const missingKeys = this.getMissingRequiredKeys(config);

    if (missingKeys.length > 0) {
      this.connectionState = {
        connected: false,
        database: config.database || 'not-configured',
        host: config.host || 'not-configured',
        port: config.port,
        provider: config.provider,
        reason: `Missing database configuration: ${missingKeys.join(', ')}`,
        ssl: config.ssl,
      };

      return this.connectionState;
    }

    // TODO(database): instantiate the real database client here.
    // For example: create a Prisma/TypeORM/pg connection using config, then store
    // that client in this service and inject it into repositories.
    this.connectionState = {
      connected: true,
      database: config.database,
      host: config.host,
      port: config.port,
      provider: config.provider,
      ssl: config.ssl,
    };

    return this.connectionState;
  }

  getConnectionState(): DatabaseConnectionState {
    if (this.connectionState) {
      return this.connectionState;
    }

    const config = this.getConfig();

    return {
      connected: false,
      database: config.database || 'not-configured',
      host: config.host || 'not-configured',
      port: config.port,
      provider: config.provider,
      reason: 'Connection has not been opened',
      ssl: config.ssl,
    };
  }

  private getMissingRequiredKeys(config: DatabaseConnectionOptions) {
    const requiredEntries = {
      DB_HOST: config.host,
      DB_NAME: config.database,
      DB_USERNAME: config.username,
      DB_PASSWORD: config.password,
    };

    return Object.entries(requiredEntries)
      .filter(([, value]) => !value)
      .map(([key]) => key);
  }
}
