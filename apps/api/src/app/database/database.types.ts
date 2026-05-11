export type DatabaseProvider = 'postgres' | 'mysql' | 'mongodb';

export type DatabaseConnectionOptions = {
  database: string;
  host: string;
  password: string;
  port: number;
  provider: DatabaseProvider;
  ssl: boolean;
  username: string;
};

export type DatabaseConnectionState = {
  connected: boolean;
  database: string;
  host: string;
  port: number;
  provider: DatabaseProvider;
  reason?: string;
  ssl: boolean;
};
