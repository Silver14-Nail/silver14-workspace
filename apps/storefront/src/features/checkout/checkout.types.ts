export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string | null;
  fee: number;
  currency: string;
  estDaysMin: number | null;
  estDaysMax: number | null;
}

export interface ContactSnapshot {
  email: string;
  phone: string;
  fullName: string;
}

export interface ShippingSnapshot {
  shippingMethodId: string;
  shippingMethodName: string;
  carrier: string | null;
  shippingFee: number;
  currency: string;
  recipientName: string;
  street: string;
  city: string;
  country: string;
  postalCode: string | null;
}

export interface SessionTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number | null;
  total: number | null;
  currency: string;
}

export interface CheckoutSession {
  id: string;
  currentStep: 1 | 2 | 3;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';
  contactSnapshot: ContactSnapshot | null;
  shippingSnapshot: ShippingSnapshot | null;
  couponCode: string | null;
  discountAmount: number;
  expiresAt: string;
  totals: SessionTotals;
}

export interface StripeIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PaypalCreateResponse {
  paypalOrderId: string;
  amount: number;
  currency: string;
}

export interface CompletedOrderRef {
  id: string;
  status: string;
  total: number;
  currency: string;
}

export interface UpdateShippingInput {
  shippingMethodId: string;
  recipientName: string;
  street: string;
  city: string;
  country: string;
  postalCode?: string;
}
