import type { PaymentMethodOption } from './types';

/**
 * Master registry of all supported payment method options.
 *
 * To add a new option:
 *   1. Append an entry here.
 *   2. Add a case to createPaymentSession() in payment.api.ts.
 *   3. Add a renderer to RENDERER_MAP in ProviderRenderer.tsx.
 *
 * PaymentStep, useCheckoutPayment, and checkout page never need to change.
 *
 * The `tags` field can be used to filter options per region or feature flag:
 *   tags: ['vn']    → Vietnam-specific methods
 *   tags: ['local'] → domestic bank card / transfer
 */
export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  // ─── Airwallex ───────────────────────────────────────────────────────────────
  {
    id: 'airwallex_card',
    provider: 'airwallex',
    paymentMethod: 'card',
    preferredMode: 'client_sdk',
    label: 'Credit / Debit Card',
    description: 'Visa · Mastercard · AMEX · JCB — powered by Airwallex',
    badges: ['VISA', 'MC', 'AMEX', 'JCB'],
  },
  {
    id: 'airwallex_applepay',
    provider: 'airwallex',
    paymentMethod: 'apple_pay',
    preferredMode: 'client_sdk',
    label: 'Apple Pay',
    description: 'Pay with Apple Pay — powered by Airwallex',
    badges: ['Apple Pay'],
  },
  {
    id: 'airwallex_googlepay',
    provider: 'airwallex',
    paymentMethod: 'google_pay',
    preferredMode: 'client_sdk',
    label: 'Google Pay',
    description: 'Pay with Google Pay — powered by Airwallex',
    badges: ['Google Pay'],
  },
  {
    id: 'airwallex_hosted',
    provider: 'airwallex',
    preferredMode: 'hosted',
    label: 'Airwallex Checkout',
    description: 'Card · Apple Pay · Google Pay — hosted checkout',
    badges: ['VISA', 'MC', 'Apple Pay', 'Google Pay'],
  },
];

/** Convenience: look up a single option by its id. */
export function findPaymentOption(id: string): PaymentMethodOption | undefined {
  return PAYMENT_METHOD_OPTIONS.find((o) => o.id === id);
}
