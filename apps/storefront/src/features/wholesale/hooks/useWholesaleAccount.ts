'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { wholesaleApi } from '../wholesale.api';
import type { WholesaleAccount, WholesaleOrdersResponse } from '../wholesale.types';

function getToken(): string | null {
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

export const WHOLESALE_ACCOUNT_KEY = ['wholesale-account'] as const;
export const WHOLESALE_ORDERS_KEY = (params?: object) =>
  ['wholesale-orders', params] as const;

export function useWholesaleAccount() {
  const { status: authStatus } = useAppSelector((s) => s.auth);

  return useQuery<WholesaleAccount>({
    queryKey: WHOLESALE_ACCOUNT_KEY,
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wholesaleApi.getAccount(token);
    },
    enabled: authStatus === 'authenticated',
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useWholesaleOrders(params?: {
  page?: number;
  limit?: number;
  paymentStatus?: string;
}) {
  const { status: authStatus } = useAppSelector((s) => s.auth);

  return useQuery<WholesaleOrdersResponse>({
    queryKey: WHOLESALE_ORDERS_KEY(params),
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wholesaleApi.getOrders(token, params);
    },
    enabled: authStatus === 'authenticated',
    staleTime: 60_000,
    retry: false,
  });
}
