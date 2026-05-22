'use client';

import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { CURRENCY_META } from '@/config/commerce.config';
import type { CurrencyCode } from '@/config/commerce.config';

export function useCurrency() {
  const code = useAppSelector((s) => s.currency.code) as CurrencyCode;
  const exchangeRates = useAppSelector((s) => s.currency.exchangeRates);

  const meta = CURRENCY_META[code] ?? CURRENCY_META['USD'];

  const rate = useMemo(() => {
    if (code === 'USD') return 1;
    if (code === 'EUR') return exchangeRates.USD_EUR;
    return 1;
  }, [code, exchangeRates]);

  const format = useCallback(
    (amountUSD: number) => {
      const converted = amountUSD * rate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    },
    [code, rate],
  );

  const convertPrice = useCallback(
    (amountUSD: number): number => parseFloat((amountUSD * rate).toFixed(2)),
    [rate],
  );

  return {
    code,
    symbol: meta.symbol,
    label: meta.label,
    rate,
    exchangeRates,
    format,
    convertPrice,
  };
}
