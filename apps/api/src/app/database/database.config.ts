import type {
  DatabaseConnectionOptions,
  DatabaseProvider,
} from './database.types';

const DEFAULT_PORT_BY_PROVIDER: Record<DatabaseProvider, number> = {
  mongodb: 27017,
  mysql: 3306,
  postgres: 5432,
};

export function getDatabaseConfig(): DatabaseConnectionOptions {
  const provider = getDatabaseProvider(process.env.DB_PROVIDER);

  return {
    database: process.env.DB_NAME ?? '',
    host: process.env.DB_HOST ?? '',
    password: process.env.DB_PASSWORD ?? '',
    port: getDatabasePort(process.env.DB_PORT, provider),
    provider,
    ssl: process.env.DB_SSL === 'true',
    username: process.env.DB_USERNAME ?? '',
  };
}

function getDatabaseProvider(value: string | undefined): DatabaseProvider {
  if (value === 'mysql' || value === 'mongodb') {
    return value;
  }

  return 'postgres';
}

function getDatabasePort(
  value: string | undefined,
  provider: DatabaseProvider,
): number {
  if (!value) {
    return DEFAULT_PORT_BY_PROVIDER[provider];
  }

  const configuredPort = Number(value);

  return Number.isFinite(configuredPort) && configuredPort > 0
    ? configuredPort
    : DEFAULT_PORT_BY_PROVIDER[provider];
}
