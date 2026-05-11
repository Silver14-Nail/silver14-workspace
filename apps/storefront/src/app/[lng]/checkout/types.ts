import type {
  ContactDetails,
  PaymentMethod,
  ShippingDetails,
} from '@/features/checkout/checkout.utils';

export type Step = 'contact' | 'shipping' | 'payment' | 'confirmation';

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

export interface CheckoutState {
  step: Step;
  checkoutType: 'guest' | 'registered';
  isProcessing: boolean;
  orderId: string;
  contact: ContactDetails;
  shipping: ShippingDetails;
  payment: PaymentMethod;
  card: CardDetails;
}

// Re-export for convenience
export type { ContactDetails, PaymentMethod, ShippingDetails };
