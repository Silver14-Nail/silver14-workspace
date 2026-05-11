import type { CustomerAuthResponse, CustomerUser } from './customer-auth.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export async function registerCustomer({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/customer/register`, {
    body: JSON.stringify({ email, name, password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Unable to register customer');
  }

  return (await response.json()) as CustomerAuthResponse;
}

export async function loginCustomer(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/customer/login`, {
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return (await response.json()) as CustomerAuthResponse;
}

export async function getCurrentCustomer(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/customer/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid customer session');
  }

  return (await response.json()) as CustomerUser;
}
