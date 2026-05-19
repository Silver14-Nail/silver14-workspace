export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
