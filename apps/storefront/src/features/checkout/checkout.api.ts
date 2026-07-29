import axios from 'axios';
import type {
  CheckoutSession,
  ShippingMethod,
  CompletedOrderRef,
  UpdateShippingInput,
} from './checkout.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE, withCredentials: true, timeout: 15000 });

function authHeaders(token?: string | null): Record<string, string> {
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

export const checkoutApi = {
  getShippingMethods: (token?: string | null) =>
    http
      .get<ShippingMethod[]>('/client-api/checkout/shipping-methods', {
        headers: authHeaders(token),
      })
      .then((r) => r.data),

  createSession: (cartId: string, token?: string | null, currency?: string) =>
    http
      .post<CheckoutSession>(
        '/client-api/checkout',
        { cartId, currency: currency ?? 'USD' },
        { headers: authHeaders(token) },
      )
      .then((r) => r.data),

  // One request instead of addItems + createSession + updateContact —
  // for a fresh checkout (no session yet) with no cart on the server.
  startCheckout: (
    items: {
      variantId: string;
      quantity: number;
      isCustomSize?: boolean;
      customMeasurements?: Record<string, string>;
    }[],
    contact: { email: string; phone: string; fullName: string },
    token?: string | null,
    currency?: string,
  ) =>
    http
      .post<CheckoutSession & { cartId: string }>(
        '/client-api/checkout/start',
        {
          items,
          currency: currency ?? 'USD',
          contactEmail: contact.email,
          contactPhone: contact.phone,
          contactFullName: contact.fullName,
        },
        { headers: authHeaders(token) },
      )
      .then((r) => r.data),

  getSession: (sessionId: string, token?: string | null) =>
    http
      .get<CheckoutSession>(`/client-api/checkout/${sessionId}`, {
        headers: authHeaders(token),
      })
      .then((r) => r.data),

  updateContact: (
    sessionId: string,
    data: { email: string; phone: string; fullName: string },
    token?: string | null,
  ) =>
    http
      .patch<CheckoutSession>(`/client-api/checkout/${sessionId}/contact`, data, {
        headers: authHeaders(token),
      })
      .then((r) => r.data),

  updateShipping: (sessionId: string, data: UpdateShippingInput, token?: string | null) =>
    http
      .patch<CheckoutSession>(`/client-api/checkout/${sessionId}/shipping`, data, {
        headers: authHeaders(token),
      })
      .then((r) => r.data),

  applyCoupon: (sessionId: string, code: string, token?: string | null) =>
    http
      .post<CheckoutSession>(
        `/client-api/checkout/${sessionId}/coupon`,
        { code },
        { headers: authHeaders(token) },
      )
      .then((r) => r.data),

  removeCoupon: (sessionId: string, token?: string | null) =>
    http
      .delete<CheckoutSession>(`/client-api/checkout/${sessionId}/coupon`, {
        headers: authHeaders(token),
      })
      .then((r) => r.data),

  getSessionOrder: (sessionId: string, token?: string | null) =>
    http
      .get<CompletedOrderRef | null>(`/client-api/checkout/${sessionId}/order`, {
        headers: authHeaders(token),
      })
      .then((r) => r.data),
};
