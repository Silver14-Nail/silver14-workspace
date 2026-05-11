import type { MockUserRole } from './mock-users';

export type TokenType = 'access' | 'refresh';

export type AuthTokenPayload = {
  email: string;
  exp: number;
  iat: number;
  role: MockUserRole;
  sub: string;
  type: TokenType;
};

export type AuthenticatedUser = {
  email: string;
  id: string;
  name: string;
  role: MockUserRole;
};

export type AuthTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: 'Bearer';
};

export type AuthenticatedRequest = {
  user?: AuthenticatedUser;
};
