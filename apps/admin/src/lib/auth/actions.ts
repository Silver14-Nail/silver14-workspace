'use server';

import { redirect } from 'next/navigation';
import { clearSession, setSession } from './session';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export type LoginState = { error: string } | null;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  let data: { tokens: { accessToken: string; refreshToken: string; expiresIn: number }; user: { id: string; fullName: string; email: string; role: string; avatarUrl: string | null } };

  try {
    const res = await fetch(`${API_URL}/api/admin-api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = Array.isArray(err.message) ? err.message[0] : err.message;
      return { error: message || 'Invalid credentials' };
    }

    data = await res.json();
  } catch {
    return { error: 'Unable to connect to server. Please try again.' };
  }

  await setSession(data.tokens, data.user);
  redirect('/');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

export async function refreshSessionAction(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/admin-api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!res.ok) {
      await clearSession();
      return false;
    }

    const data = await res.json();
    await setSession(data.tokens, data.user);
    return true;
  } catch {
    await clearSession();
    return false;
  }
}
