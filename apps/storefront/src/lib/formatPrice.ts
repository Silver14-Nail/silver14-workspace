import type { CurrencyCode } from '@/config/commerce.config';

/**
 * Formats a USD base amount into the target currency.
 * All prices stored in DB are USD; pass the live exchange rate from Redux.
 */
export function formatPrice(amountUSD: number, currency: CurrencyCode, rate: number): string {
  const converted = amountUSD * rate;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}
