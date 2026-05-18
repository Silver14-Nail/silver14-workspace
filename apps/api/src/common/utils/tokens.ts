import * as jwt from 'jsonwebtoken';

export const BEARER_SCHEMA_PREFIX = 'Bearer ';

export const generate = (
  payload: Record<string, any>,
  secret: string,
  expiresIn: number | string,
) =>
  jwt.sign(payload, secret, {
    expiresIn,
  });

interface DecodedToken {
  iat: number;
  exp: number;
}
export const verify = <T>(token: string, secret: string, options?: jwt.VerifyOptions) =>
  jwt.verify(token, secret, options) as DecodedToken & T;
export const decode = <T>(token: string, options?: jwt.DecodeOptions) =>
  jwt.decode(token, options) as DecodedToken & T;

export const tokenToBearerSchema = (token: string) => `${BEARER_SCHEMA_PREFIX}${token}`;
export const bearerSchemaToToken = (bearerSchema: string) =>
  bearerSchema.replace(BEARER_SCHEMA_PREFIX, '');
