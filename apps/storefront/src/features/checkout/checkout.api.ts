import type {
  CheckoutSession,
  ShippingMethod,
  StripeIntentResponse,
  PaypalCreateResponse,
  CompletedOrderRef,
  UpdateShippingInput,
} from './checkout.types';

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

export const checkoutApi = {
  getShippingMethods: (token?: string | null) =>
    api<ShippingMethod[]>(`${BASE}/client-api/checkout/shipping-methods`, {
      headers: authHeaders(token),
    }),

  createSession: (cartId: string, token?: string | null) =>
    api<CheckoutSession>(`${BASE}/client-api/checkout`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ cartId }),
    }),

  getSession: (sessionId: string, token?: string | null) =>
    api<CheckoutSession>(`${BASE}/client-api/checkout/${sessionId}`, {
      headers: authHeaders(token),
    }),

  updateContact: (
    sessionId: string,
    data: { email: string; phone: string; fullName: string },
    token?: string | null,
  ) =>
    api<CheckoutSession>(`${BASE}/client-api/checkout/${sessionId}/contact`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  updateShipping: (sessionId: string, data: UpdateShippingInput, token?: string | null) =>
    api<CheckoutSession>(`${BASE}/client-api/checkout/${sessionId}/shipping`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  applyCoupon: (sessionId: string, code: string, token?: string | null) =>
    api<CheckoutSession>(`${BASE}/client-api/checkout/${sessionId}/coupon`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ code }),
    }),

  removeCoupon: (sessionId: string, token?: string | null) =>
    api<CheckoutSession>(`${BASE}/client-api/checkout/${sessionId}/coupon`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  initiateStripe: (checkoutSessionId: string, token?: string | null) =>
    api<StripeIntentResponse>(`${BASE}/client-api/payments/stripe/intent`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ checkoutSessionId }),
    }),

  createPaypalOrder: (checkoutSessionId: string, token?: string | null) =>
    api<PaypalCreateResponse>(`${BASE}/client-api/payments/paypal/create-order`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ checkoutSessionId }),
    }),

  capturePaypalOrder: (paypalOrderId: string, checkoutSessionId: string, token?: string | null) =>
    api<{ order: CompletedOrderRef }>(`${BASE}/client-api/payments/paypal/capture`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ paypalOrderId, checkoutSessionId }),
    }),

  getSessionOrder: (sessionId: string, token?: string | null) =>
    api<CompletedOrderRef | null>(`${BASE}/client-api/checkout/${sessionId}/order`, {
      headers: authHeaders(token),
    }),
};
