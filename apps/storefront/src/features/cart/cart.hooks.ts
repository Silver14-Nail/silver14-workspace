'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import {
  getGuestCartId,
  clearGuestCartId,
  broadcastGuestCartId,
  GUEST_CART_ID_UPDATED,
  EMPTY_LOCAL_CART,
  LOCAL_CART_UPDATED,
  getLocalCart,
  saveLocalCart,
  clearLocalCart,
} from './cart.storage';
import { cartApi, type AddItemInput } from './cart.api';
import { adaptCart, calcCartTotals } from './cart.utils';
import type { ApiCart, CartDisplayItem } from './cart.types';

export const CART_QUERY_KEY = ['cart'] as const;

type AddItemVariables = AddItemInput & {
  optimisticItem?: import('./cart.types').CartOptimisticItem;
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

function createOptimisticCartItem(
  input: AddItemVariables,
): import('./cart.types').ApiCartItem | null {
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

  // ── Safari localStorage cart state ────────────────────────────────────────
  // isSafari is detected on the client (not SSR) to avoid hydration mismatches.
  // All Safari cart operations bypass the API and work directly on localStorage.
  const [isSafari, setIsSafari] = useState(false);
  const [localCart, setLocalCart] = useState<ApiCart>(EMPTY_LOCAL_CART);
  // Ref mirrors localCart so rapid synchronous addItem calls (before a re-render)
  // see the latest value rather than stale closure state.
  const localCartRef = useRef<ApiCart>(EMPTY_LOCAL_CART);
  localCartRef.current = localCart;

  useEffect(() => {
    // Detect Safari — must run on client, not during SSR
    const safari =
      /Safari\//.test(navigator.userAgent) &&
      !/Chrome\/|CriOS\/|FxiOS\/|EdgiOS\/|OPiOS\//.test(navigator.userAgent);
    setIsSafari(safari);

    if (safari) {
      const stored = getLocalCart();
      setLocalCart(stored);
      localCartRef.current = stored;
    }

    setGuestCartIdState(getGuestCartId());
    setCartStorageReady(true);

    // Sync guestCartId state when MutationCache.onSuccess writes a new cartId
    // (fires even after the product page has unmounted).
    const handleCartIdUpdate = (e: Event) => {
      const cartId = (e as CustomEvent<{ cartId: string }>).detail.cartId;
      setGuestCartIdState(cartId);
    };
    window.addEventListener(GUEST_CART_ID_UPDATED, handleCartIdUpdate);

    // Sync Safari localStorage cart state when any useCart() instance writes
    // (product page writes → Navbar badge and cart page update automatically).
    const handleLocalCartUpdate = (e: Event) => {
      const cart = (e as CustomEvent<{ cart: ApiCart }>).detail.cart;
      localCartRef.current = cart;
      setLocalCart(cart);
    };
    window.addEventListener(LOCAL_CART_UPDATED, handleLocalCartUpdate);

    return () => {
      window.removeEventListener(GUEST_CART_ID_UPDATED, handleCartIdUpdate);
      window.removeEventListener(LOCAL_CART_UPDATED, handleLocalCartUpdate);
    };
  }, []);

  const credentials = useMemo(() => {
    if (authStatus === 'authenticated' && tokens?.accessToken) {
      return { accessToken: tokens.accessToken, guestCartId: null as string | null };
    }
    return { accessToken: null as string | null, guestCartId };
  }, [authStatus, tokens?.accessToken, guestCartId]);

  const queryKey = useMemo(
    () =>
      [
        ...CART_QUERY_KEY,
        credentials.accessToken ? `user:${userId ?? 'unknown'}` : 'guest',
        credentials.accessToken ?? credentials.guestCartId ?? 'none',
      ] as const,
    [credentials.accessToken, credentials.guestCartId, userId],
  );

  // API cart query — disabled on Safari (localStorage replaces it entirely)
  const { data: rawCartFromApi, isLoading: apiIsLoading } = useQuery({
    queryKey,
    queryFn: () => cartApi.getCart(credentials.accessToken, credentials.guestCartId),
    enabled:
      !isSafari &&
      typeof window !== 'undefined' &&
      cartStorageReady &&
      authStatus !== 'checking' &&
      (authStatus !== 'authenticated' || Boolean(credentials.accessToken)),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: (prev: ApiCart | null | undefined) => prev,
    select: (data) => (data ? adaptCart(data) : null),
  });

  // ── Auto-merge guest cart on login ────────────────────────────────────────
  useEffect(() => {
    if (isSafari) return; // Safari: no BE cart to merge
    const guestId = getGuestCartId();
    if (authStatus === 'authenticated' && tokens?.accessToken && guestId) {
      cartApi
        .mergeCart(guestId, tokens.accessToken)
        .then(() => {
          clearGuestCartId();
          setGuestCartIdState(null);
          queryClient.invalidateQueries({ queryKey });
        })
        .catch(() => {});
    }
  }, [authStatus, isSafari, queryClient, queryKey, tokens?.accessToken]);

  // ── API mutations (non-Safari only) ───────────────────────────────────────

  const pendingAddsRef = useRef(0);
  const addBatchSnapshotRef = useRef<ApiCart | null | undefined>(undefined);
  const latestAddServerCartRef = useRef<ApiCart | null>(null);
  const debouncedAddsRef = useRef<Record<string, DebouncedAddEntry>>({});
  const credsRef = useRef(credentials);
  credsRef.current = credentials;

  const addItemMutation = useMutation({
    mutationKey: ['cart', 'addItem'],
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
        broadcastGuestCartId(data.cartId);
        setGuestCartIdState(data.cartId);
      }
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

  const addItem = (input: AddItemVariables): Promise<void> => {
    // ── Safari: localStorage only, no API call ────────────────────────────
    if (isSafari) {
      const newCart = applyOptimisticAdd(localCartRef.current, input) ?? localCartRef.current;
      localCartRef.current = newCart;
      setLocalCart(newCart);
      saveLocalCart(newCart);
      return Promise.resolve();
    }

    // ── Non-Safari: debounced API call with optimistic update ──────────────
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
        flushDebouncedAdd(key).catch(() => {});
      }, ADD_ITEM_DEBOUNCE_MS);

      return new Promise<void>((resolve, reject) => {
        existing.handlers.push({ resolve, reject });
      });
    }

    return new Promise<void>((resolve, reject) => {
      debouncedAddsRef.current[key] = {
        input,
        quantity: input.quantity,
        snapshot,
        timer: setTimeout(() => {
          flushDebouncedAdd(key).catch(() => {});
        }, 0),
        handlers: [{ resolve, reject }],
      };
    });
  };

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
    // ── Safari: update localStorage directly ──────────────────────────────
    if (isSafari) {
      const newCart = {
        ...localCartRef.current,
        items: localCartRef.current.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i,
        ),
      };
      localCartRef.current = newCart;
      setLocalCart(newCart);
      saveLocalCart(newCart);
      return;
    }

    // ── Non-Safari: debounced API call ─────────────────────────────────────
    queryClient.cancelQueries({ queryKey });

    if (!updateDebounceRef.current[itemId]) {
      updateSnapshotRef.current[itemId] = queryClient.getQueryData<ApiCart>(queryKey);
    }

    queryClient.setQueryData<ApiCart | null>(queryKey, (old) => {
      if (!old) return old;
      return { ...old, items: old.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)) };
    });

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
      // Cancel any background fetch that may have started after onMutate's cancelQueries
      // (e.g. triggered by a window-focus event during the API call). Without this, a
      // late-resolving background fetch would overwrite the correct data and cause a flicker.
      queryClient.cancelQueries({ queryKey });
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

  const adaptedLocalCart = useMemo(() => adaptCart(localCart), [localCart]);

  const rawCart = isSafari ? adaptedLocalCart : rawCartFromApi;
  const cartId: string | null = isSafari ? null : (rawCart?.id ?? null);
  const items: CartDisplayItem[] = rawCart?.items ?? [];
  const { cartCount, subtotal } = calcCartTotals(items);
  const isLoading = isSafari ? false : apiIsLoading;
  const isMutating =
    !isSafari &&
    (addItemMutation.isPending ||
      updateItemMutation.isPending ||
      removeItemMutation.isPending ||
      clearCartMutation.isPending);

  return {
    cartId,
    items,
    cartCount,
    subtotal,
    total: subtotal,
    isLoading,
    isMutating,
    addItemError: isSafari ? null : addItemMutation.error,
    addItem,
    updateItem,
    removeItem: (itemId: string) => {
      if (isSafari) {
        const newCart = {
          ...localCartRef.current,
          items: localCartRef.current.items.filter((i) => i.id !== itemId),
        };
        localCartRef.current = newCart;
        setLocalCart(newCart);
        saveLocalCart(newCart);
        return Promise.resolve();
      }
      return removeItemMutation.mutateAsync(itemId);
    },
    clearCart: () => {
      if (isSafari) {
        localCartRef.current = EMPTY_LOCAL_CART;
        setLocalCart(EMPTY_LOCAL_CART);
        clearLocalCart();
        return Promise.resolve();
      }
      return clearCartMutation.mutateAsync();
    },
  };
}
