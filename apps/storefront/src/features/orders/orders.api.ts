import type { CustomerOrdersResponse, CustomerOrderDetail } from './orders.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

function authHeaders(token: string): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(
      typeof data['message'] === 'string' ? data['message'] : `API error ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export const ordersApi = {
  getMyOrders: (token: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return api<CustomerOrdersResponse>(`${BASE}/client-api/orders/my${query}`, {
      headers: authHeaders(token),
    });
  },

  getMyOrder: (token: string, orderId: string) =>
    api<CustomerOrderDetail>(`${BASE}/client-api/orders/my/${orderId}`, {
      headers: authHeaders(token),
    }),
};
