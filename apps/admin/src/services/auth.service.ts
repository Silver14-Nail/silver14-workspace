import axios, { isAxiosError } from 'axios';
import { cookies } from 'next/headers';

const API_BASE = process.env.API_URL || 'http://localhost:5000';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
};

export type AuthResponse = {
  tokens: AuthTokens;
  user: AuthUser;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

// ─── HTTP client (no auth token required for login/refresh) ──────────────────

const authClient = axios.create({
  baseURL: `${API_BASE}/api/admin-api/auth`,
  headers: { 'Content-Type': 'application/json' },
});

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    return Array.isArray(msg) ? msg[0] : msg || fallback;
  }
  return fallback;
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await authClient.post<AuthResponse>('/login', { email, password });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, 'Invalid credentials'));
  }
}

export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  try {
    const { data } = await authClient.post<AuthResponse>('/refresh', { refreshToken });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, 'Session expired'));
  }
}

// ─── Session management (httpOnly cookies) ───────────────────────────────────

const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = store.get(REFRESH_TOKEN_KEY)?.value;
  const userJson = store.get(USER_KEY)?.value;

  if (!accessToken || !refreshToken || !userJson) return null;

  try {
    return { accessToken, refreshToken, user: JSON.parse(userJson) as AuthUser };
  } catch {
    return null;
  }
}

export async function setSession(tokens: AuthTokens, user: AuthUser): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: tokens.expiresIn,
  });
  store.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60,
  });
  store.set(USER_KEY, JSON.stringify(user), {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_KEY);
  store.delete(REFRESH_TOKEN_KEY);
  store.delete(USER_KEY);
}
