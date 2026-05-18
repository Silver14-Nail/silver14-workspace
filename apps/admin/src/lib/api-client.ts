import axios, { type AxiosInstance } from 'axios';
import { cookies } from 'next/headers';

const API_BASE = process.env.API_URL || 'http://localhost:5000';

/**
 * Creates an axios instance with the current admin session token attached.
 * Must only be called from Server Components or Server Actions.
 */
export async function createApiClient(): Promise<AxiosInstance> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_access_token')?.value;

  return axios.create({
    baseURL: `${API_BASE}/api`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
