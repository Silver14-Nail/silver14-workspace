import type {
  ContactDetails,
  PaymentMethod,
  ShippingDetails,
} from '@/features/checkout/checkout.utils';

export type Step = 'contact' | 'shipping' | 'payment' | 'confirmation';

// Re-export for convenience
export type { ContactDetails, PaymentMethod, ShippingDetails };
