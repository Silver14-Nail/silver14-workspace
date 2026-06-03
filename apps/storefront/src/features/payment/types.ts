// ─── Provider identity ────────────────────────────────────────────────────────

export type PaymentProviderName = 'airwallex' | 'ngan_luong';

export type PaymentFlowMode =
  | 'client_sdk' // Airwallex Elements
  | 'hosted' // Airwallex Hosted
  | 'redirect'; // NgLuong redirect

// ─── Flow status state machine ────────────────────────────────────────────────

export type PaymentFlowStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'error';

// ─── Payment method option ────────────────────────────────────────────────────

export interface PaymentMethodOption {
  id: string;
  provider: PaymentProviderName;
  paymentMethod?: string;
  preferredMode?: PaymentFlowMode;
  label: string;
  description: string;
  badges: string[];
  tags?: string[];
}

// ─── Provider session data ────────────────────────────────────────────────────

export type ProviderSessionData =
  | {
      mode: 'client_sdk';
      providerRef: string;
      clientSecret: string;
      amount: number;
      currency: string;
    }
  | {
      mode: 'hosted';
      providerRef: string;
      hostedUrl: string;
    }
  | {
      mode: 'redirect';
      providerRef: string;
      redirectUrl: string;
    };

export interface ProviderSession {
  provider: PaymentProviderName;
  checkoutSessionId: string;
  sessionData: ProviderSessionData;
}

// ─── Renderer props contract ──────────────────────────────────────────────────

export interface ProviderRendererProps {
  session: ProviderSession;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}
