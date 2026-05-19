'use server';

import { redirect } from 'next/navigation';

import { clearSession, loginWithCredentials, refreshTokens, setSession } from './auth.service';

export type LoginState = { error: string } | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const { tokens, user } = await loginWithCredentials(email, password);
    await setSession(tokens, user);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unable to connect to server.' };
  }

  redirect('/');
}

export async function logoutAction(): Promise<never> {
  await clearSession();
  redirect('/login');
}

export async function refreshSessionAction(refreshToken: string): Promise<boolean> {
  try {
    const { tokens, user } = await refreshTokens(refreshToken);
    await setSession(tokens, user);
    return true;
  } catch {
    await clearSession();
    return false;
  }
}
