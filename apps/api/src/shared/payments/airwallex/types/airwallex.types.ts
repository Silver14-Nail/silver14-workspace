// ─── API Authentication ──────────────────────────────────────────────────

export interface AirwallexAuthToken {
  token: string;
  expiresAt: Date;
}

// ─── Payment Intent ──────────────────────────────────────────────────────

export interface AirwallexCreatePaymentIntentParams {
  amount: number;
  currency: string;
  merchantOrderId?: string;
  /** Requested payment method types */
  paymentMethodOptions?: {
    /** e.g. 'card', 'apple_pay', 'google_pay' */
    type: string[];
    card?: {
      /** Enable saving the card for future payments */
      saveCard?: boolean;
    };
  };
  metadata?: Record<string, string>;
  returnUrl?: string;
  requestId?: string;
}

export interface AirwallexPaymentIntent {
  id: string;
  object: 'payment_intent';
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_customer_action'
    | 'processing'
    | 'requires_capture'
    | 'succeeded'
    | 'failed'
    | 'cancelled';
  amount: number;
  currency: string;
  merchantOrderId: string | null;
  clientSecret: string;
  paymentMethodOptions?: {
    type?: string[];
  };
  customerId: string | null;
  paymentMethodId: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Method / Saved Cards ────────────────────────────────────────

export interface AirwallexPaymentMethod {
  id: string;
  object: 'payment_method';
  type: 'card' | 'apple_pay' | 'google_pay';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    fingerprint: string;
    country: string;
  };
  billing?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      city: string;
      country: string;
      line1: string;
      line2: string;
      postalCode: string;
      state: string;
    };
  };
  customerId: string | null;
  createdAt: string;
}

// ─── Customer ────────────────────────────────────────────────────────────

export interface AirwallexCreateCustomerParams {
  merchantCustomerId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  metadata?: Record<string, string>;
}

export interface AirwallexCustomer {
  id: string;
  object: 'customer';
  merchantCustomerId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
}

// ─── Checkout Session ────────────────────────────────────────────────────

export interface AirwallexCreateCheckoutSessionParams {
  amount: number;
  currency: string;
  merchantOrderId?: string;
  returnUrl: string;
  cancelUrl?: string;
  paymentMethodOptions?: {
    type: string[];
    card?: {
      allowSaveCard?: boolean;
    };
  };
  customerId?: string;
  customer?: AirwallexCreateCustomerParams;
  metadata?: Record<string, string>;
}

export interface AirwallexCheckoutSession {
  id: string;
  object: 'checkout_session';
  status: 'initiated' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  amount: number;
  currency: string;
  merchantOrderId: string | null;
  returnUrl: string;
  cancelUrl: string | null;
  clientSecret: string;
  url: string;
  customerId: string | null;
  paymentIntentId: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Refund ──────────────────────────────────────────────────────────────

export interface AirwallexCreateRefundParams {
  paymentIntentId: string;
  amount?: number;
  currency?: string;
  reason?: string;
  metadata?: Record<string, string>;
  requestId?: string;
}

export interface AirwallexRefund {
  id: string;
  object: 'refund';
  status: 'succeeded' | 'pending' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paymentIntentId: string;
  reason: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Webhook Event ───────────────────────────────────────────────────────

export interface AirwallexWebhookEvent {
  id: string;
  object: 'event';
  type: string;
  data: Record<string, any>;
  createdAt: string;
  /** Airwallex sends the raw body + headers; we verify the signature separately */
}

export type AirwallexWebhookPayload = string;

// ─── Inquiry ─────────────────────────────────────────────────────────────

export interface AirwallexInquiryParams {
  resourceId: string;
  resourceType: 'payment_intent' | 'refund' | 'checkout_session';
}

// ─── Saved Card / Recurring ──────────────────────────────────────────────

export interface AirwallexSavedCard {
  id: string;
  paymentMethodId: string;
  customerId: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    fingerprint: string;
  };
  createdAt: string;
}

export interface AirwallexRecurringPaymentParams {
  paymentMethodId: string;
  amount: number;
  currency: string;
  merchantOrderId?: string;
  metadata?: Record<string, string>;
  requestId?: string;
}

// ─── API Error ───────────────────────────────────────────────────────────

export interface AirwallexApiError {
  code: string;
  message: string;
  source: string;
  details?: Record<string, any>;
}
