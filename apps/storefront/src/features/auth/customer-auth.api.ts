import type {
  CustomerAuthResponse,
  CustomerUser,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from './customer-auth.types';

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const json = (await res.json()) as { message?: string };
      if (typeof json.message === 'string') message = json.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function registerCustomer(input: {
  email: string;
  name: string;
  password: string;
}): Promise<CustomerAuthResponse> {
  return post('/client-api/auth/register', input);
}

export async function loginCustomer(
  email: string,
  password: string,
): Promise<CustomerAuthResponse> {
  return post('/client-api/auth/login', { email, password });
}

export async function logoutCustomer(): Promise<void> {
  await post('/client-api/auth/logout');
}

export async function refreshCustomerToken(): Promise<CustomerAuthResponse> {
  return post('/client-api/auth/refresh');
}

export async function getCurrentCustomer(accessToken: string): Promise<CustomerUser> {
  const res = await fetch(`${getApiBase()}/client-api/auth/me`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Invalid or expired session');
  }

  return res.json() as Promise<CustomerUser>;
}

export async function forgotCustomerPassword(email: string): Promise<ForgotPasswordResponse> {
  return post('/client-api/auth/forgot-password', { email });
}

export async function resetCustomerPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return post('/client-api/auth/reset-password', { token, newPassword });
}

export function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}
