import type { ApiCart, ApiAddItemResponse } from './cart.types';

const getBase = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

function buildHeaders(
  accessToken: string | null,
  guestCartId: string | null,
): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
  const res = await fetch(`${getBase()}${path}`, {
    method,
    headers: buildHeaders(accessToken ?? null, guestCartId ?? null),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (res.status === 204) return null as T;

  const data = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) {
    throw new Error(typeof data?.message === 'string' ? data.message : `API error ${res.status}`);
  }
  return data as T;
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
