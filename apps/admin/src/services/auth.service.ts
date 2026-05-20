import { isAxiosError } from 'axios';

import { httpClient } from '@/lib/http.client';
import { TokenStorage } from '@/lib/token.storage';
import type { AuthResponse, AuthUser } from '@/types/auth.types';

function extractError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    return Array.isArray(msg) ? msg[0] : (msg ?? fallback);
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: unknown }).message;
    return Array.isArray(msg) ? msg[0] : String(msg ?? fallback);
  }
  return fallback;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const { data } = await httpClient.post<AuthResponse>('/admin-api/auth/login', {
        email,
        password,
      });
      const { tokens, user } = data;
      TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      httpClient.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;
      return user;
    } catch (err) {
      throw new Error(extractError(err, 'Invalid credentials'));
    }
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post('/admin-api/auth/logout');
    } finally {
      TokenStorage.clear();
      delete httpClient.defaults.headers.common.Authorization;
    }
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await httpClient.get<AuthUser>('/admin-api/auth/me');
    return data;
  },
};
