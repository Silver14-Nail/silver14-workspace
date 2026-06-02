// ─── Provider identity ────────────────────────────────────────────────────────

export type PaymentProviderName = 'airwallex';

export type PaymentFlowMode =
  | 'client_sdk' // provider JS SDK runs in-page (Airwallex Elements)
  | 'hosted'; // fully hosted checkout on provider domain (Airwallex Hosted)

// ─── Flow status state machine ────────────────────────────────────────────────

export type PaymentFlowStatus =
  | 'idle' // no option selected or session not yet requested
  | 'requesting' // POST /payments/session in flight
  | 'ready' // session exists; provider UI is rendering
  | 'processing' // user submitted payment; waiting for confirmation
  | 'success' // order confirmed by backend
  | 'failed' // payment declined
  | 'cancelled' // user dismissed the provider UI
  | 'error'; // unexpected API / network error

// ─── Payment method option ────────────────────────────────────────────────────

/**
 * Describes a single selectable payment option shown in the UI.
 *
 * Adding a new option ONLY requires appending to PAYMENT_METHOD_OPTIONS —
 * no changes to hooks, PaymentStep, or checkout page.
 */
export interface PaymentMethodOption {
  /** Unique key across all providers. e.g. 'airwallex_card', 'airwallex_applepay'. */
  id: string;
  provider: PaymentProviderName;
  /** Provider-specific method hint forwarded to the backend. */
  paymentMethod?: string;
  preferredMode?: PaymentFlowMode;
  label: string;
  description: string;
  badges: string[];
  /** Regional / feature tags for display filtering. e.g. ['vn', 'local']. */
  tags?: string[];
}

// ─── Provider session data ────────────────────────────────────────────────────

/**
 * Discriminated union returned after session creation.
 * The `mode` field drives what provider renderer does next.
 */
export type ProviderSessionData =
  | {
      mode: 'client_sdk';
      providerRef: string; // Airwallex: paymentIntentId
      clientSecret: string;
      amount: number;
      currency: string;
    }
  | {
      mode: 'hosted';
      providerRef: string;
      hostedUrl: string;
    };

export interface ProviderSession {
  provider: PaymentProviderName;
  checkoutSessionId: string;
  sessionData: ProviderSessionData;
}

// ─── Renderer props contract ──────────────────────────────────────────────────

/**
 * Every provider renderer receives exactly this interface.
 * Renderers are self-contained: they manage their own loading, error,
 * and retry states internally. They only communicate completion outward.
 */
export interface ProviderRendererProps {
  session: ProviderSession;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}
