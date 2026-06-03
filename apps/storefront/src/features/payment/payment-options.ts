import type { PaymentMethodOption } from './types';

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  // ─── OnePAY ──────────────────────────────────────────────────────────────────
  {
    id: 'onepay_international',
    provider: 'onepay',
    paymentMethod: 'INTERNATIONAL',
    preferredMode: 'redirect',
    label: 'Thẻ quốc tế',
    description: 'Visa · Mastercard · AMEX · JCB — qua OnePAY',
    badges: ['VISA', 'MC', 'AMEX', 'JCB'],
  },
  {
    id: 'onepay_domestic',
    provider: 'onepay',
    paymentMethod: 'DOMESTIC',
    preferredMode: 'redirect',
    label: 'Thẻ ATM Nội địa',
    description: 'Thẻ ATM nội địa liên kết — qua OnePAY',
    badges: ['ATM', 'Napas'],
  },
  {
    id: 'onepay_qr',
    provider: 'onepay',
    paymentMethod: 'QR',
    preferredMode: 'redirect',
    label: 'QR / Ví điện tử',
    description: 'Quét mã QR hoặc ứng dụng ngân hàng — qua OnePAY',
    badges: ['QR', 'MoMo', 'ZaloPay'],
  },
];

export function findPaymentOption(id: string): PaymentMethodOption | undefined {
  return PAYMENT_METHOD_OPTIONS.find((o) => o.id === id);
}
