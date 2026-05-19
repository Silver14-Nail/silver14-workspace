'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { formatPrice } from '@/lib/formatPrice';

export function useCurrency() {
  const { code, symbol, rate, label } = useAppSelector((state) => state.currency.current);

  const format = useCallback(
    (amountUSD: number) => formatPrice(amountUSD, symbol, rate),
    [symbol, rate],
  );

  return { code, symbol, rate, label, format };
}
