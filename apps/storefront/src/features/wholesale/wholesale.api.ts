import type {
  WholesaleTier,
  WholesaleAccount,
  WholesaleOrdersResponse,
  SubmitEnquiryInput,
} from './wholesale.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

function authHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
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

export const wholesaleApi = {
  getTiers: () =>
    api<WholesaleTier[]>(`${BASE}/client-api/wholesales/tiers`),

  submitEnquiry: (data: SubmitEnquiryInput) =>
    api<{ id: string; status: string }>(`${BASE}/client-api/wholesales/enquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getAccount: (token: string) =>
    api<WholesaleAccount>(`${BASE}/client-api/wholesales/account`, {
      headers: authHeaders(token),
    }),

  getOrders: (
    token: string,
    params?: { page?: number; limit?: number; paymentStatus?: string },
  ) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.paymentStatus) qs.set('paymentStatus', params.paymentStatus);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return api<WholesaleOrdersResponse>(
      `${BASE}/client-api/wholesales/account/orders${query}`,
      { headers: authHeaders(token) },
    );
  },
};
