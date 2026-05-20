export const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.79, label: 'British Pound' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING_COST = 9.99;
