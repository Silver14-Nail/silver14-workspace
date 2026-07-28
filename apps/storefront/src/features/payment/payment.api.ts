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
}

export async function createPaymentSession(
  provider: PaymentProviderName,
  checkoutSessionId: string,
  opts: CreateSessionOpts = {},
): Promise<ProviderSession> {
  const { paymentMethod, locale, token } = opts;
  const headers = authHeaders(token);

  let sessionData: ProviderSessionData;

  switch (provider) {
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

    default:
      throw new Error(`Unknown payment provider: ${provider as string}`);
  }

  return { provider, checkoutSessionId, sessionData };
}
