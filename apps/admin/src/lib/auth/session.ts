import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
  const userJson = cookieStore.get(USER_KEY)?.value;

  if (!accessToken || !refreshToken || !userJson) return null;

  try {
    const user = JSON.parse(userJson) as SessionUser;
    return { accessToken, refreshToken, user };
  } catch {
    return null;
  }
}

export async function setSession(
  tokens: { accessToken: string; refreshToken: string; expiresIn: number },
  user: SessionUser,
) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };

  cookieStore.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
    ...cookieOptions,
    maxAge: tokens.expiresIn,
  });

  cookieStore.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });

  cookieStore.set(USER_KEY, JSON.stringify(user), {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
  cookieStore.delete(USER_KEY);
}
