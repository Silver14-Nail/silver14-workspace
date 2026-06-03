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
  locale?: string;
  currency?: string;
}

export async function createPaymentSession(
  provider: PaymentProviderName,
  checkoutSessionId: string,
  opts: CreateSessionOpts = {},
): Promise<ProviderSession> {
  const { paymentMethod, preferredMode, token, locale, currency } = opts;
  const headers = authHeaders(token);

  let sessionData: ProviderSessionData;

  switch (provider) {
    case 'airwallex': {
      const useCheckout = preferredMode === 'hosted';

      if (useCheckout) {
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

    case 'onepay': {
      const res = await http.post<{
        redirectUrl: string;
        merchTxnRef: string;
        amountOnepay: number;
      }>(
        '/client-api/payments/onepay/initiate',
        {
          checkoutSessionId,
          cardList: paymentMethod ?? undefined,
          locale: locale ?? 'en',
          currency: currency ?? undefined,
        },
        { headers },
      );
      sessionData = {
        mode: 'redirect',
        providerRef: res.data.merchTxnRef,
        redirectUrl: res.data.redirectUrl,
      };
      break;
    }

    case 'ngan_luong': {
      const pm = paymentMethod ?? 'ATM_ONLINE';
      const bankCode = pm === 'VISA' ? 'VISA' : pm === 'QRCODE' ? 'VCB' : 'EXB';
      const res = await http.post<{
        token: string;
        checkoutUrl: string;
        amountVnd: number;
      }>(
        '/client-api/payments/nganluong/initiate',
        { checkoutSessionId, paymentMethod: pm, bankCode },
        { headers },
      );
      sessionData = {
        mode: 'redirect',
        providerRef: res.data.token,
        redirectUrl: res.data.checkoutUrl,
      };
      break;
    }

    default:
      throw new Error(`Unknown payment provider: ${provider as string}`);
  }

  return { provider, checkoutSessionId, sessionData };
}
