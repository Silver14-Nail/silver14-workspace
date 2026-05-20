'use client';

import { useQuery } from '@tanstack/react-query';
import { wholesaleApi } from '../wholesale.api';
import type { WholesaleTier } from '../wholesale.types';

export const WHOLESALE_TIERS_KEY = ['wholesale-tiers'] as const;

export function useWholesaleTiers() {
  return useQuery<WholesaleTier[]>({
    queryKey: WHOLESALE_TIERS_KEY,
    queryFn: () => wholesaleApi.getTiers(),
    staleTime: 10 * 60 * 1000,
  });
}
