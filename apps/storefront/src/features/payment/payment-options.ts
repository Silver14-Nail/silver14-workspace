import type { PaymentMethodOption } from './types';

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

  // ─── Ngân Lượng ─────────────────────────────────────────────────────────────
  {
    id: 'ngluong_visa',
    provider: 'ngan_luong',
    paymentMethod: 'VISA',
    preferredMode: 'redirect',
    label: 'Visa / Master / JCB',
    description: 'Thanh toán thẻ quốc tế qua Ngân Lượng',
    badges: ['VISA', 'MC', 'JCB'],
    tags: ['vn'],
  },
  {
    id: 'ngluong_atm',
    provider: 'ngan_luong',
    paymentMethod: 'ATM_ONLINE',
    preferredMode: 'redirect',
    label: 'Thẻ ATM Nội địa',
    description: 'Thanh toán qua thẻ ATM nội địa — Ngân Lượng',
    badges: ['ATM', 'Napas'],
    tags: ['vn'],
  },
  {
    id: 'ngluong_ib',
    provider: 'ngan_luong',
    paymentMethod: 'IB_ONLINE',
    preferredMode: 'redirect',
    label: 'Internet Banking',
    description: 'Thanh toán qua Internet Banking — Ngân Lượng',
    badges: ['Bank'],
    tags: ['vn'],
  },
  {
    id: 'ngluong_qr',
    provider: 'ngan_luong',
    paymentMethod: 'QRCODE',
    preferredMode: 'redirect',
    label: 'QR Code VNPay',
    description: 'Quét mã QR thanh toán qua Ngân Lượng',
    badges: ['QR'],
    tags: ['vn'],
  },
  {
    id: 'ngluong_transfer',
    provider: 'ngan_luong',
    paymentMethod: 'BANK_TRANSFER_ONLINE',
    preferredMode: 'redirect',
    label: 'Chuyển khoản nhận ngay',
    description: 'Chuyển khoản ngân hàng — xác nhận tức thì',
    badges: ['Bank', '24/7'],
    tags: ['vn'],
  },
];

export function findPaymentOption(id: string): PaymentMethodOption | undefined {
  return PAYMENT_METHOD_OPTIONS.find((o) => o.id === id);
}
