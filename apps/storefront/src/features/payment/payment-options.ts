import type { PaymentMethodOption } from './types';

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  // ─── OnePAY ──────────────────────────────────────────────────────────────────
  {
    id: 'onepay',
    provider: 'onepay',
    paymentMethod: undefined,
    preferredMode: 'redirect',
    label: 'Thanh toán OnePAY',
    description: 'Thẻ quốc tế · Thẻ ATM nội địa · QR — qua OnePAY',
    badges: ['VISA', 'MC', 'ATM', 'QR'],
  },
];

export function findPaymentOption(id: string): PaymentMethodOption | undefined {
  return PAYMENT_METHOD_OPTIONS.find((o) => o.id === id);
}
