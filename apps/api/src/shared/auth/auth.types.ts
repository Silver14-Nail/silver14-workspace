export type TokenType = 'access' | 'refresh';

export type AuthenticatedUser = {
  email: string;
  id: string;
  name: string;
  role: string;
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
