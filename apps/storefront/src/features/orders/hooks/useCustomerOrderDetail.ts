'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { ordersApi } from '../orders.api';
import type { CustomerOrderDetail } from '../orders.types';

function getToken(): string | null {
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

export const CUSTOMER_ORDER_DETAIL_KEY = (orderId: string) =>
  ['customer-order', orderId] as const;

export function useCustomerOrderDetail(orderId: string) {
  const { status: authStatus } = useAppSelector((s) => s.auth);

  return useQuery<CustomerOrderDetail>({
    queryKey: CUSTOMER_ORDER_DETAIL_KEY(orderId),
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return ordersApi.getMyOrder(token, orderId);
    },
    enabled: authStatus === 'authenticated' && Boolean(orderId),
    staleTime: 60_000,
    retry: false,
  });
}
