import { TokenUtils } from '.';
import { Response, CookieOptions, Request } from 'express';

export const TOKEN_COOKIE_NAME = 'jwt-token';

export const setToken = (res: Response, token: string, options?: CookieOptions): void => {
  const bearerSchema = TokenUtils.tokenToBearerSchema(token);
  res.cookie(TOKEN_COOKIE_NAME, bearerSchema, {
    httpOnly: true,
    maxAge: TokenUtils.decode(token).exp,
    ...options,
  });
};

export const getToken = (req: Request): string | undefined =>
  req.cookies &&
  req.cookies[TOKEN_COOKIE_NAME] &&
  TokenUtils.bearerSchemaToToken(req.cookies[TOKEN_COOKIE_NAME]);

export const clearToken = (res: Response): void => {
  res.clearCookie(TOKEN_COOKIE_NAME);
};
