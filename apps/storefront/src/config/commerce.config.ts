export const SUPPORTED_CURRENCIES = ['USD', 'EUR'] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro' },
};

export const DEFAULT_CURRENCY_CODE: CurrencyCode = 'USD';

export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING_COST = 9.99;

export const CURRENCY_COOKIE = 'silver14_currency';
