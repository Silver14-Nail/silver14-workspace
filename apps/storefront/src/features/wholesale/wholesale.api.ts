import axios from 'axios';
import type {
  WholesaleTier,
  WholesaleAccount,
  WholesaleOrdersResponse,
  SubmitEnquiryInput,
} from './wholesale.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE, withCredentials: true });

export const wholesaleApi = {
  getTiers: () =>
    http.get<WholesaleTier[]>('/client-api/wholesales/tiers').then((r) => r.data),

  submitEnquiry: (data: SubmitEnquiryInput) =>
    http
      .post<{ id: string; status: string }>('/client-api/wholesales/enquire', data)
      .then((r) => r.data),

  getAccount: (token: string) =>
    http
      .get<WholesaleAccount>('/client-api/wholesales/account', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => r.data),

  getOrders: (
    token: string,
    params?: { page?: number; limit?: number; paymentStatus?: string },
  ) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.paymentStatus) qs.set('paymentStatus', params.paymentStatus);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return http
      .get<WholesaleOrdersResponse>(`/client-api/wholesales/account/orders${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => r.data);
  },
};
