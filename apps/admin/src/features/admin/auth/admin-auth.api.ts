import type {
  AdminLoginResponse,
  AdminTwoFactorSetup,
  AdminUser,
  LoginResponse,
} from './admin-auth.types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return (await response.json()) as AdminLoginResponse;
}

export async function verifyAdminTwoFactor(challengeId: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
    body: JSON.stringify({ challengeId, code }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Invalid two-factor code');
  }

  return (await response.json()) as LoginResponse;
}

export async function createAdminTwoFactorSetup(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Unable to start two-factor setup');
  }

  return (await response.json()) as AdminTwoFactorSetup;
}

export async function enableAdminTwoFactor(accessToken: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
    body: JSON.stringify({ code }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Invalid two-factor code');
  }

  return (await response.json()) as { enabled: true };
}

export async function getCurrentAdmin(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid admin session');
  }

  return (await response.json()) as AdminUser;
}
