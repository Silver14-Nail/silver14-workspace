import axios, { type AxiosInstance } from 'axios';
import { cookies } from 'next/headers';

const SERVER_API_BASE = `${process.env.API_URL || 'http://localhost:3000'}/api`;

/**
 * Authenticated axios instance for Server Components and Server Actions.
 * Reads the admin_access_token from httpOnly cookies.
 * ONLY import this in server-side code.
 */
export async function createApiClient(): Promise<AxiosInstance> {
  const store = await cookies();
  const token = store.get('admin_access_token')?.value;

  return axios.create({
    baseURL: SERVER_API_BASE,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
