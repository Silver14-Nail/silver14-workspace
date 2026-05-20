// CartItemType is the real API-backed CartDisplayItem
export type { CartDisplayItem as CartItemType } from '@/features/cart/cart.types';

export const FREE_SHIPPING_THRESHOLD = 100;

export const PAYMENT_METHODS = ['Visa', 'Mastercard', 'PayPal'] as const;
