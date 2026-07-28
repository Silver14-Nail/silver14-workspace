// ─── Provider identity ────────────────────────────────────────────────────────

export type PaymentProviderName = 'onepay';

export type PaymentFlowMode = 'redirect';

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

export interface ProviderSessionData {
  mode: 'redirect';
  providerRef: string;
  redirectUrl: string;
}

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
