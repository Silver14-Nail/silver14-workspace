'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';
import { getGuestCartId, setGuestCartId, clearGuestCartId } from './cart.storage';
import { cartApi, type AddItemInput } from './cart.api';
import { adaptCart, calcCartTotals } from './cart.utils';
import type { ApiCart, CartDisplayItem } from './cart.types';

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

  const addItemMutation = useMutation({
    mutationFn: (dto: AddItemInput) => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.addItem(dto, accessToken, guestCartId);
    },
    onSuccess: (data) => {
      if (!tokens?.accessToken) {
        setGuestCartId(data.cartId);
      }
      // Server returns full cart — write directly to cache, no extra GET needed
      queryClient.setQueryData<ApiCart>(queryKey, data.cart);
    },
  });

  // Per-item debounce: batches rapid +/- clicks into a single API call.
  // UI updates optimistically on every click; the server call fires 500ms
  // after the last click for that item.
  const updateDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const updateSnapshotRef = useRef<Record<string, ApiCart | undefined>>({});
  const pendingUpdatesRef = useRef(0);

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.updateItem(itemId, quantity, accessToken, guestCartId);
    },
    onSuccess: (data) => {
      pendingUpdatesRef.current = Math.max(0, pendingUpdatesRef.current - 1);
      // Only write server data when all in-flight updates have settled
      if (pendingUpdatesRef.current === 0) {
        queryClient.setQueryData<ApiCart>(queryKey, data);
      }
    },
    onError: (_err, vars) => {
      pendingUpdatesRef.current = Math.max(0, pendingUpdatesRef.current - 1);
      const snapshot = updateSnapshotRef.current[vars.itemId];
      if (snapshot !== undefined) queryClient.setQueryData(queryKey, snapshot);
    },
  });

  const updateItem = (itemId: string, quantity: number) => {
    queryClient.cancelQueries({ queryKey });

    // Capture snapshot at the start of each debounce window (first click only)
    if (!updateDebounceRef.current[itemId]) {
      updateSnapshotRef.current[itemId] = queryClient.getQueryData<ApiCart>(queryKey);
    }

    // Immediate optimistic update — UI reflects change without waiting for API
    queryClient.setQueryData<ApiCart | null>(queryKey, (old) => {
      if (!old) return old;
      return { ...old, items: old.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)) };
    });

    // Reset timer on every click; API fires only after 500ms of inactivity
    clearTimeout(updateDebounceRef.current[itemId]);
    updateDebounceRef.current[itemId] = setTimeout(() => {
      delete updateDebounceRef.current[itemId];
      delete updateSnapshotRef.current[itemId];
      pendingUpdatesRef.current += 1;
      updateItemMutation.mutate({ itemId, quantity });
    }, 500);
  };

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.removeItem(itemId, accessToken, guestCartId);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey });
      const snapshot = queryClient.getQueryData<ApiCart>(queryKey);
      queryClient.setQueryData<ApiCart | null>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, items: old.items.filter((i) => i.id !== itemId) };
      });
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot !== undefined) queryClient.setQueryData(queryKey, ctx.snapshot);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ApiCart>(queryKey, data);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => {
      const { accessToken, guestCartId } = getCredentials();
      return cartApi.clearCart(accessToken, guestCartId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ApiCart | null>(queryKey, data);
    },
  });

  // ── Derived state ─────────────────────────────────────────────────────────

  const cartId: string | null = rawCart?.id ?? null;
  const items: CartDisplayItem[] = rawCart?.items ?? [];
  const { cartCount, subtotal } = calcCartTotals(items);
  const isMutating =
    addItemMutation.isPending ||
    updateItemMutation.isPending ||
    removeItemMutation.isPending ||
    clearCartMutation.isPending;

  return {
    cartId,
    items,
    cartCount,
    subtotal,
    total: subtotal, // discount handled at checkout session level
    isLoading,
    isMutating,
    addItemError: addItemMutation.error,
    addItem: (dto: AddItemInput) => addItemMutation.mutateAsync(dto),
    updateItem,
    removeItem: (itemId: string) => removeItemMutation.mutateAsync(itemId),
    clearCart: () => clearCartMutation.mutateAsync(),
  };
}
