import * as Joi from 'joi';
import { StringUtils } from '@/common/utils';

export interface EnvConfiguration {
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;
  allowedHosts: Array<string>;
  enableSwagger: boolean;
  corsOrigin?: string[];
  secret: string;
  tokenExpires: number;
  refreshTokenExpires: number;
  jwtSecret: string;

  databaseType: string;
  databaseHost: string;
  mysqlDatabase: string;
  mysqlUser: string;
  mysqlPassword: string;
  mysqlRootPassword: string;
  mysqlPort: number;
}

const validationSchema = Joi.object<any, EnvConfiguration>({
  nodeEnv: Joi.string().valid('development', 'staging', 'production').required(),
  port: Joi.number().required(),
  allowedHosts: Joi.array().items(Joi.string()),
  enableSwagger: Joi.boolean().required(),
  corsOrigin: Joi.array().items(Joi.string()).optional(),
  secret: Joi.string().required(),
  tokenExpires: Joi.number().required(),
  refreshTokenExpires: Joi.number().required(),
  jwtSecret: Joi.string().default('local-development-jwt-secret'),

  databaseType: Joi.string().required(),
  databaseHost: Joi.string().required(),
  mysqlDatabase: Joi.string().required(),
  mysqlUser: Joi.string().required(),
  mysqlPassword: Joi.string().required(),
  mysqlRootPassword: Joi.string().required(),
  mysqlPort: Joi.number().required(),
});

export default () => {
  const env: Record<string, any> = {};
  for (const key in process.env) {
    env[key] = StringUtils.getEnvWithoutComment(process.env[key] || '');
  }

  const envConfiguration: Partial<EnvConfiguration> = {
    nodeEnv: env.NODE_ENV || 'development',
    port: parseInt(env.PORT) || 3000,
    allowedHosts: env.ALLOWED_HOSTS ? env.ALLOWED_HOSTS.replace(/ /g, '').split(',') : [],
    enableSwagger: env.ENABLE_SWAGGER ? ['true', 1, true].includes(env.ENABLE_SWAGGER) : false,
    corsOrigin: env.CORS_ORIGIN ? env.CORS_ORIGIN.replace(/ /g, '').split(',') : undefined,
    secret: env.SECRET_KEY,
    tokenExpires: parseInt(env.TOKEN_EXPIRES) || 3600,
    refreshTokenExpires: parseInt(env.REFRESH_TOKEN_EXPIRES) || 604800,
    jwtSecret: env.JWT_SECRET || 'local-development-jwt-secret',

    databaseType: env.DATABASE_TYPE,
    databaseHost: env.DATABASE_HOST,
    mysqlDatabase: env.MYSQL_DATABASE,
    mysqlUser: env.MYSQL_USER,
    mysqlPassword: env.MYSQL_PASSWORD,
    mysqlRootPassword: env.MYSQL_ROOT_PASSWORD,
    mysqlPort: parseInt(env.MYSQL_PORT),
  };

  const { error } = validationSchema.validate(envConfiguration);
  if (error) {
    throw new Error(`ENV configuration error: ${error.message}`);
  }

  return envConfiguration;
};
