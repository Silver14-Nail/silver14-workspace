import axios from 'axios';
import type { CustomerOrdersResponse, CustomerOrderDetail } from './orders.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE, withCredentials: true });

export const ordersApi = {
  getMyOrders: (token: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return http
      .get<CustomerOrdersResponse>(`/client-api/orders/my${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => r.data);
  },

  getMyOrder: (token: string, orderId: string) =>
    http
      .get<CustomerOrderDetail>(`/client-api/orders/my/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => r.data),
};
