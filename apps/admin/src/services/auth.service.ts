import axios, { isAxiosError } from 'axios';

import type { AuthUser } from '@/types/auth.types';

const api = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function extractError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    return Array.isArray(msg) ? msg[0] : (msg ?? fallback);
  }
  return fallback;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const { data } = await api.post<{ user: AuthUser }>('/login', { email, password });
      return data.user;
    } catch (err) {
      throw new Error(extractError(err, 'Invalid credentials'));
    }
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/me');
    return data;
  },

  async refresh(): Promise<AuthUser> {
    const { data } = await api.post<{ user: AuthUser }>('/refresh');
    return data.user;
  },
};
