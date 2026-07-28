import axios from 'axios';
import type { ApiCart, ApiAddItemResponse } from './cart.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE, withCredentials: true, timeout: 15000 });

function buildHeaders(
  accessToken: string | null,
  guestCartId: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (guestCartId) {
    headers['x-cart-id'] = guestCartId;
  }
  return headers;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  accessToken?: string | null,
  guestCartId?: string | null,
): Promise<T> {
  const response = await http.request<T>({
    method,
    url: path,
    data: body,
    headers: buildHeaders(accessToken ?? null, guestCartId ?? null),
  });
  if (response.status === 204) return null as T;
  return response.data;
}

export interface AddItemInput {
  variantId: string;
  quantity: number;
  isCustomSize?: boolean;
  customMeasurements?: Record<string, string>;
}

export const cartApi = {
  getCart: (accessToken: string | null, guestCartId: string | null) =>
    request<ApiCart | null>('GET', '/client-api/cart', undefined, accessToken, guestCartId),

  addItem: (dto: AddItemInput, accessToken: string | null, guestCartId: string | null) =>
    request<ApiAddItemResponse>('POST', '/client-api/cart/items', dto, accessToken, guestCartId),

  addItems: (items: AddItemInput[], accessToken: string | null, guestCartId: string | null) =>
    request<ApiAddItemResponse>(
      'POST',
      '/client-api/cart/items/bulk',
      { items },
      accessToken,
      guestCartId,
    ),

  updateItem: (
    itemId: string,
    quantity: number,
    accessToken: string | null,
    guestCartId: string | null,
  ) =>
    request<ApiCart>(
      'PATCH',
      `/client-api/cart/items/${itemId}`,
      { quantity },
      accessToken,
      guestCartId,
    ),

  removeItem: (itemId: string, accessToken: string | null, guestCartId: string | null) =>
    request<ApiCart>(
      'DELETE',
      `/client-api/cart/items/${itemId}`,
      undefined,
      accessToken,
      guestCartId,
    ),

  clearCart: (accessToken: string | null, guestCartId: string | null) =>
    request<ApiCart | null>('DELETE', '/client-api/cart', undefined, accessToken, guestCartId),

  mergeCart: (guestCartId: string, accessToken: string) =>
    request<ApiCart>('POST', '/client-api/cart/merge', { guestCartId }, accessToken),
};
