import axios from 'axios';
import type {
  CustomerAuthResponse,
  CustomerUser,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from './customer-auth.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE, withCredentials: true });

export async function registerCustomer(input: {
  email: string;
  name: string;
  password: string;
}): Promise<CustomerAuthResponse> {
  const { data } = await http.post<CustomerAuthResponse>('/client-api/auth/register', input);
  return data;
}

export async function loginCustomer(
  email: string,
  password: string,
): Promise<CustomerAuthResponse> {
  const { data } = await http.post<CustomerAuthResponse>('/client-api/auth/login', {
    email,
    password,
  });
  return data;
}

export async function logoutCustomer(): Promise<void> {
  await http.post('/client-api/auth/logout');
}

export async function refreshCustomerToken(): Promise<CustomerAuthResponse> {
  const { data } = await http.post<CustomerAuthResponse>('/client-api/auth/refresh');
  return data;
}

export async function getCurrentCustomer(accessToken: string): Promise<CustomerUser> {
  const { data } = await http.get<CustomerUser>('/client-api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

export async function forgotCustomerPassword(email: string): Promise<ForgotPasswordResponse> {
  const { data } = await http.post<ForgotPasswordResponse>('/client-api/auth/forgot-password', {
    email,
  });
  return data;
}

export async function resetCustomerPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  const { data } = await http.post<ResetPasswordResponse>('/client-api/auth/reset-password', {
    token,
    newPassword,
  });
  return data;
}

export function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}
