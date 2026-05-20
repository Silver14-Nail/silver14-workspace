import Axios from 'axios';

import { TokenStorage } from './token.storage';

type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };

let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];

function drainQueue(err: unknown, token: string | null) {
  refreshQueue.forEach((cb) => (err ? cb.reject(err) : cb.resolve(token!)));
  refreshQueue = [];
}

export const httpClient = Axios.create({
  baseURL: '/backend',
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = TokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error.response?.data ?? error);
    }

    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      TokenStorage.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return httpClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refresher = Axios.create({ baseURL: '/backend' });
      const { data } = await refresher.post('/admin-api/auth/refresh', { refreshToken });
      const { tokens } = data;

      TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      httpClient.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;
      drainQueue(null, tokens.accessToken);

      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return httpClient(original);
    } catch (refreshErr) {
      drainQueue(refreshErr, null);
      TokenStorage.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);
