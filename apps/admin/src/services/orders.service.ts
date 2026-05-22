import { createApiClient } from './api-client';
import type {
  OrderListQuery,
  OrderListResponse,
  OrderDetail,
  OrderStats,
  OrderStatus,
  PaymentStatus,
} from '../app/(admin)/admin/orders/types';

export async function listOrders(query?: OrderListQuery): Promise<OrderListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<OrderListResponse>('/admin-api/orders', { params: query });
  return data;
}

export async function getOrder(id: string): Promise<OrderDetail> {
  const client = await createApiClient();
  const { data } = await client.get<OrderDetail>(`/admin-api/orders/${id}`);
  return data;
}

export async function getOrderStats(): Promise<OrderStats> {
  const client = await createApiClient();
  const { data } = await client.get<OrderStats>('/admin-api/orders/stats');
  return data;
}

export async function updateOrderStatus(
  id: string,
  payload: { status: OrderStatus; reason?: string },
): Promise<OrderDetail> {
  const client = await createApiClient();
  const { data } = await client.patch<OrderDetail>(`/admin-api/orders/${id}/status`, payload);
  return data;
}

export async function updatePaymentStatus(
  id: string,
  payload: { status: PaymentStatus; note?: string },
): Promise<void> {
  const client = await createApiClient();
  await client.patch(`/admin-api/orders/${id}/payment-status`, payload);
}

export async function updateShipping(
  id: string,
  payload: { carrier?: string | null; trackingNumber?: string | null },
): Promise<OrderDetail> {
  const client = await createApiClient();
  const { data } = await client.patch<OrderDetail>(`/admin-api/orders/${id}/shipping`, payload);
  return data;
}

export async function cancelOrder(id: string, payload: { reason?: string }): Promise<OrderDetail> {
  const client = await createApiClient();
  const { data } = await client.post<OrderDetail>(`/admin-api/orders/${id}/cancel`, payload);
  return data;
}

export async function updateShippingFee(
  id: string,
  payload: { shippingFee: number },
): Promise<OrderDetail> {
  const client = await createApiClient();
  const { data } = await client.patch<OrderDetail>(`/admin-api/orders/${id}/shipping-fee`, payload);
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/orders/${id}`);
}
