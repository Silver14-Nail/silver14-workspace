'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { ordersApi } from '../orders.api';
import type { CustomerOrdersResponse } from '../orders.types';

function getToken(): string | null {
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

export const CUSTOMER_ORDERS_KEY = (params?: object) => ['customer-orders', params] as const;

export function useCustomerOrders(params?: { page?: number; limit?: number }) {
  const { status: authStatus } = useAppSelector((s) => s.auth);

  return useQuery<CustomerOrdersResponse>({
    queryKey: CUSTOMER_ORDERS_KEY(params),
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return ordersApi.getMyOrders(token, params);
    },
    enabled: authStatus === 'authenticated',
    staleTime: 60_000,
    retry: false,
  });
}
