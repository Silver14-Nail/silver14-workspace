'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { getGuestCartId, setGuestCartId, clearGuestCartId } from './cart.storage';
import { cartApi, type AddItemInput } from './cart.api';
import { adaptCart, calcCartTotals } from './cart.utils';
import type { CartDisplayItem } from './cart.types';

export const CART_QUERY_KEY = ['cart'] as const;

/** Resolve current auth credentials synchronously from localStorage. */
function getCredentials() {
  const tokens = getStoredCustomerTokens();
  if (tokens && !isAccessTokenExpired(tokens)) {
    return { accessToken: tokens.accessToken, guestCartId: null as string | null };
  }
  return { accessToken: null as string | null, guestCartId: getGuestCartId() };
}

// ─── useCart ─────────────────────────────────────────────────────────────────

export function useCart() {
  const queryClient = useQueryClient();

  // Auth state from Redux — changes here trigger a new queryKey → fresh fetch
  const { status: authStatus, tokens } = useAppSelector((s) => s.auth);
  const userId = useAppSelector((s) => s.auth.user?.id ?? null);

  // Key includes userId so auth changes auto-invalidate the cached cart
  const queryKey = [...CART_QUERY_KEY, userId ?? 'guest'] as const;

  const { data: rawCart, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.getCart(accessToken, guestCartId);
    },
    enabled: authStatus !== 'checking',
    staleTime: 30_000,
    select: (data) => (data ? adaptCart(data) : null),
  });

  // ── Auto-merge guest cart on login ────────────────────────────────────────
  useEffect(() => {
    const guestCartId = getGuestCartId();
    if (authStatus === 'authenticated' && tokens?.accessToken && guestCartId) {
      cartApi
        .mergeCart(guestCartId, tokens.accessToken)
        .then(() => {
          clearGuestCartId();
          queryClient.invalidateQueries({ queryKey });
        })
        .catch(() => {
          // Non-critical: guest cart merge failed, skip silently
        });
    }
  }, [authStatus]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const addItemMutation = useMutation({
    mutationFn: (dto: AddItemInput) => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.addItem(dto, accessToken, guestCartId);
    },
    onSuccess: (data) => {
      // Persist guest cart ID returned by the server
      if (!tokens?.accessToken) {
        setGuestCartId(data.cartId);
      }
      invalidate();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.updateItem(itemId, quantity, accessToken, guestCartId);
    },
    onSuccess: invalidate,
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.removeItem(itemId, accessToken, guestCartId);
    },
    onSuccess: invalidate,
  });

  const clearCartMutation = useMutation({
    mutationFn: () => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.clearCart(accessToken, guestCartId);
    },
    onSuccess: invalidate,
  });

  // ── Derived state ─────────────────────────────────────────────────────────

  const items: CartDisplayItem[] = rawCart?.items ?? [];
  const { cartCount, subtotal } = calcCartTotals(items);
  const isMutating =
    addItemMutation.isPending ||
    updateItemMutation.isPending ||
    removeItemMutation.isPending ||
    clearCartMutation.isPending;

  return {
    items,
    cartCount,
    subtotal,
    total: subtotal, // discount handled at checkout session level
    isLoading,
    isMutating,
    addItemError: addItemMutation.error,
    addItem: (dto: AddItemInput) => addItemMutation.mutateAsync(dto),
    updateItem: (itemId: string, quantity: number) =>
      updateItemMutation.mutateAsync({ itemId, quantity }),
    removeItem: (itemId: string) => removeItemMutation.mutateAsync(itemId),
    clearCart: () => clearCartMutation.mutateAsync(),
  };
}
