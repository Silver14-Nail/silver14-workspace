'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { getGuestCartId, setGuestCartId, clearGuestCartId } from './cart.storage';
import { cartApi, type AddItemInput } from './cart.api';
import { adaptCart, calcCartTotals } from './cart.utils';
import type { ApiCart, ApiCartItem, CartDisplayItem, CartOptimisticItem } from './cart.types';

export const CART_QUERY_KEY = ['cart'] as const;

type AddItemVariables = AddItemInput & {
  optimisticItem?: CartOptimisticItem;
};

type AddItemPromiseHandler = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

type DebouncedAddEntry = {
  input: AddItemVariables;
  quantity: number;
  snapshot: ApiCart | null | undefined;
  timer: ReturnType<typeof setTimeout>;
  handlers: AddItemPromiseHandler[];
};

const ADD_ITEM_DEBOUNCE_MS = 350;

function getAddDebounceKey(input: AddItemVariables): string {
  return JSON.stringify({
    variantId: input.variantId,
    isCustomSize: input.isCustomSize ?? false,
    customMeasurements: input.customMeasurements ?? null,
  });
}

function createOptimisticCartItem(input: AddItemVariables): ApiCartItem | null {
  if (!input.optimisticItem) return null;

  return {
    id: `optimistic:${input.variantId}:${Date.now()}`,
    quantity: input.quantity,
    isCustomSize: input.isCustomSize ?? false,
    customMeasurements: input.customMeasurements ?? null,
    variant: {
      ...input.optimisticItem.variant,
      product: input.optimisticItem.product,
    },
  };
}

function applyOptimisticAdd(
  old: ApiCart | null | undefined,
  input: AddItemVariables,
): ApiCart | null {
  const optimisticItem = createOptimisticCartItem(input);
  if (!optimisticItem) return old ?? null;

  const cart: ApiCart = old ?? {
    id: 'optimistic-cart',
    status: 'ACTIVE',
    expiresAt: null,
    items: [],
  };

  if (!input.isCustomSize) {
    const existing = cart.items.find(
      (item) => !item.isCustomSize && item.variant.id === input.variantId,
    );
    if (existing) {
      return {
        ...cart,
        items: cart.items.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + input.quantity } : item,
        ),
      };
    }
  }

  return { ...cart, items: [...cart.items, optimisticItem] };
}

// ─── useCart ─────────────────────────────────────────────────────────────────

export function useCart() {
  const queryClient = useQueryClient();

  // Auth state from Redux — changes here trigger a new queryKey → fresh fetch
  const { status: authStatus, tokens } = useAppSelector((s) => s.auth);
  const userId = useAppSelector((s) => s.auth.user?.id ?? null);
  const [guestCartId, setGuestCartIdState] = useState<string | null>(null);
  const [cartStorageReady, setCartStorageReady] = useState(false);

  useEffect(() => {
    setGuestCartIdState(getGuestCartId());
    setCartStorageReady(true);
  }, []);

  const credentials = useMemo(() => {
    if (authStatus === 'authenticated' && tokens?.accessToken) {
      return { accessToken: tokens.accessToken, guestCartId: null as string | null };
    }

    return { accessToken: null as string | null, guestCartId };
  }, [authStatus, tokens?.accessToken, guestCartId]);

  // Key includes the active credential so auth/guest-cart changes fetch the matching cart.
  const queryKey = useMemo(
    () =>
      [
        ...CART_QUERY_KEY,
        credentials.accessToken ? `user:${userId ?? 'unknown'}` : 'guest',
        credentials.accessToken ?? credentials.guestCartId ?? 'none',
      ] as const,
    [credentials.accessToken, credentials.guestCartId, userId],
  );

  const { data: rawCart, isLoading } = useQuery({
    queryKey,
    queryFn: () => cartApi.getCart(credentials.accessToken, credentials.guestCartId),
    enabled:
      typeof window !== 'undefined' &&
      cartStorageReady &&
      authStatus !== 'checking' &&
      (authStatus !== 'authenticated' || Boolean(credentials.accessToken)),
    staleTime: 30_000,
    // Keep previous data while queryKey changes (e.g. auth resolves → userId changes)
    // so the cart doesn't flash empty between guest and authenticated states.
    placeholderData: (prev: ApiCart | null | undefined) => prev,
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
          setGuestCartIdState(null);
          queryClient.invalidateQueries({ queryKey });
        })
        .catch(() => {
          // Non-critical: guest cart merge failed, skip silently
        });
    }
  }, [authStatus, queryClient, queryKey, tokens?.accessToken]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const pendingAddsRef = useRef(0);
  const addBatchSnapshotRef = useRef<ApiCart | null | undefined>(undefined);
  const latestAddServerCartRef = useRef<ApiCart | null>(null);
  const debouncedAddsRef = useRef<Record<string, DebouncedAddEntry>>({});
  const credsRef = useRef(credentials);
  credsRef.current = credentials;

  const addItemMutation = useMutation({
    mutationFn: (input: AddItemVariables) => {
      const c = credsRef.current;
      return cartApi.addItem(
        {
          variantId: input.variantId,
          quantity: input.quantity,
          isCustomSize: input.isCustomSize,
          customMeasurements: input.customMeasurements,
        },
        c.accessToken,
        c.guestCartId,
      );
    },
    onSuccess: (data) => {
      pendingAddsRef.current = Math.max(0, pendingAddsRef.current - 1);
      latestAddServerCartRef.current = data.cart;
      const c = credsRef.current;
      if (!c.accessToken) {
        setGuestCartId(data.cartId);
        setGuestCartIdState(data.cartId);
      }
      // Server returns full cart — write directly to cache, no extra GET needed
      if (pendingAddsRef.current === 0 && Object.keys(debouncedAddsRef.current).length === 0) {
        queryClient.setQueryData<ApiCart>(queryKey, latestAddServerCartRef.current);
        addBatchSnapshotRef.current = undefined;
        latestAddServerCartRef.current = null;
      }
    },
  });

  const flushDebouncedAdd = async (key: string) => {
    const entry = debouncedAddsRef.current[key];
    if (!entry) return;
    delete debouncedAddsRef.current[key];

    pendingAddsRef.current += 1;
    try {
      await addItemMutation.mutateAsync({
        ...entry.input,
        quantity: entry.quantity,
        optimisticItem: undefined,
      });
      entry.handlers.forEach(({ resolve }) => resolve());
    } catch (error) {
      pendingAddsRef.current = Math.max(0, pendingAddsRef.current - 1);
      if (pendingAddsRef.current === 0 && Object.keys(debouncedAddsRef.current).length === 0) {
        if (latestAddServerCartRef.current) {
          queryClient.setQueryData<ApiCart>(queryKey, latestAddServerCartRef.current);
        } else {
          queryClient.setQueryData(queryKey, addBatchSnapshotRef.current ?? entry.snapshot ?? null);
        }
        addBatchSnapshotRef.current = undefined;
        latestAddServerCartRef.current = null;
      }
      entry.handlers.forEach(({ reject }) => reject(error));
    }
  };

  const addItem = (input: AddItemVariables) => {
    const key = getAddDebounceKey(input);
    const snapshot = queryClient.getQueryData<ApiCart | null>(queryKey);

    if (pendingAddsRef.current === 0 && Object.keys(debouncedAddsRef.current).length === 0) {
      addBatchSnapshotRef.current = snapshot;
      latestAddServerCartRef.current = null;
    }

    queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<ApiCart | null>(queryKey, (old) => applyOptimisticAdd(old, input));

    const existing = debouncedAddsRef.current[key];
    if (existing) {
      existing.quantity += input.quantity;
      existing.input = { ...input, quantity: existing.quantity };
      clearTimeout(existing.timer);
      existing.timer = setTimeout(() => {
        flushDebouncedAdd(key).catch(() => {
          // Errors are handled inside flushDebouncedAdd (calls reject on handlers).
          // This catch prevents an unhandled-promise-rejection warning in the browser.
        });
      }, ADD_ITEM_DEBOUNCE_MS);

      return new Promise<void>((resolve, reject) => {
        existing.handlers.push({ resolve, reject });
      });
    }

    // First add for this key: fire immediately (0 ms) so that mutateAsync is in-flight
    // before the user navigates to the cart page. This ensures isMutating > 0 on the
    // cart page, which keeps CartSkeleton visible while the API call resolves.
    // Subsequent rapid adds reuse the existing entry and reset the debounce timer.
    return new Promise<void>((resolve, reject) => {
      debouncedAddsRef.current[key] = {
        input,
        quantity: input.quantity,
        snapshot,
        timer: setTimeout(() => {
          flushDebouncedAdd(key).catch(() => {
            // Errors are handled inside flushDebouncedAdd (calls reject on handlers).
            // This catch prevents an unhandled-promise-rejection warning in the browser.
          });
        }, 0),
        handlers: [{ resolve, reject }],
      };
    });
  };

  // Per-item debounce: batches rapid +/- clicks into a single API call.
  // UI updates optimistically on every click; the server call fires 500ms
  // after the last click for that item.
  const updateDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const updateSnapshotRef = useRef<Record<string, ApiCart | undefined>>({});
  const pendingUpdatesRef = useRef(0);

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const c = credsRef.current;
      return cartApi.updateItem(itemId, quantity, c.accessToken, c.guestCartId);
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
      const c = credsRef.current;
      return cartApi.removeItem(itemId, c.accessToken, c.guestCartId);
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
      const c = credsRef.current;
      return cartApi.clearCart(c.accessToken, c.guestCartId);
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
    addItem,
    updateItem,
    removeItem: (itemId: string) => removeItemMutation.mutateAsync(itemId),
    clearCart: () => clearCartMutation.mutateAsync(),
  };
}
