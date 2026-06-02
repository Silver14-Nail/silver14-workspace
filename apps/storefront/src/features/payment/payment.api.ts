import axios from 'axios';
import type {
  PaymentProviderName,
  PaymentFlowMode,
  ProviderSession,
  ProviderSessionData,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
const http = axios.create({ baseURL: BASE, withCredentials: true });

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface CreateSessionOpts {
  paymentMethod?: string;
  preferredMode?: PaymentFlowMode;
  token?: string | null;
}

/**
 * Provider-agnostic session creator.
 *
 * Currently adapts to the existing per-provider backend endpoints.
 *
 * Migration path: when POST /client-api/payments/session is implemented
 * on the backend (Phase 4 of the payment architecture plan), replace all
 * switch cases with a single:
 *   const res = await http.post('/client-api/payments/session', { provider, checkoutSessionId, ... })
 *   return normalizeSessionResponse(res.data);
 *
 * Callers (useCheckoutPayment, renderers) never change.
 */
export async function createPaymentSession(
  provider: PaymentProviderName,
  checkoutSessionId: string,
  opts: CreateSessionOpts = {},
): Promise<ProviderSession> {
  const { paymentMethod, preferredMode, token } = opts;
  const headers = authHeaders(token);

  let sessionData: ProviderSessionData;

  switch (provider) {
    // ─── Airwallex ─────────────────────────────────────────────────────────────
    case 'airwallex': {
      const useCheckout = preferredMode === 'hosted';

      if (useCheckout) {
        // Hosted Checkout Session — redirect to Airwallex's hosted page
        const returnUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}?payment=success`
            : '';
        const res = await http.post<{
          checkoutSessionRef: string;
          url: string;
          clientSecret: string;
          amount: number;
          currency: string;
        }>(
          '/client-api/payments/airwallex/checkout-session',
          { checkoutSessionId, returnUrl },
          { headers },
        );
        sessionData = {
          mode: 'hosted',
          providerRef: res.data.checkoutSessionRef,
          hostedUrl: res.data.url,
        };
      } else {
        // Client SDK — embedded Elements
        const pmTypes = paymentMethod ? [paymentMethod] : ['card', 'apple_pay', 'google_pay'];
        const res = await http.post<{
          clientSecret: string;
          paymentIntentId: string;
          amount: number;
          currency: string;
        }>(
          '/client-api/payments/airwallex/payment-intent',
          { checkoutSessionId, paymentMethodTypes: pmTypes },
          { headers },
        );
        sessionData = {
          mode: 'client_sdk',
          providerRef: res.data.paymentIntentId,
          clientSecret: res.data.clientSecret,
          amount: res.data.amount,
          currency: res.data.currency,
        };
      }
      break;
    }

    default:
      throw new Error(`Unknown payment provider: ${provider as string}`);
  }

  return { provider, checkoutSessionId, sessionData };
}
