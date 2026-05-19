export const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.79, label: 'British Pound' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING_COST = 9.99;
export const ORDER_ID_PREFIX = 'LNL-';

export const DISCOUNT_CODES: Record<string, number> = {
  SILVER14: 0.1,
  WELCOME15: 0.15,
  EU20: 0.2,
};
