'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EMPTY_LOCAL_CART,
  LOCAL_CART_UPDATED,
  getLocalCart,
  saveLocalCart,
  clearLocalCart,
} from './cart.storage';
import type { AddItemInput } from './cart.api';
import { adaptCart, calcCartTotals } from './cart.utils';
import type { ApiCart, CartDisplayItem } from './cart.types';

export const CART_QUERY_KEY = ['cart'] as const;

type AddItemVariables = AddItemInput & {
  optimisticItem?: import('./cart.types').CartOptimisticItem;
};

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

  const cart: ApiCart = old ?? { id: 'local', status: 'ACTIVE', expiresAt: null, items: [] };

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
// Cart is stored in localStorage across all browsers. On checkout, the cart is
// synced to the backend API to create a real cart ID for the checkout session.

export function useCart() {
  const [localCart, setLocalCart] = useState<ApiCart>(EMPTY_LOCAL_CART);
  // Ref mirrors state so rapid synchronous addItem calls see the latest value
  // before React re-renders.
  const localCartRef = useRef<ApiCart>(EMPTY_LOCAL_CART);
  localCartRef.current = localCart;
  const [cartStorageReady, setCartStorageReady] = useState(false);

  useEffect(() => {
    const stored = getLocalCart();
    setLocalCart(stored);
    localCartRef.current = stored;
    setCartStorageReady(true);

    // Sync cart state when any other useCart() instance (Navbar, cart page, etc.) writes.
    const handleLocalCartUpdate = (e: Event) => {
      const cart = (e as CustomEvent<{ cart: ApiCart }>).detail.cart;
      localCartRef.current = cart;
      setLocalCart(cart);
    };
    window.addEventListener(LOCAL_CART_UPDATED, handleLocalCartUpdate);
    return () => window.removeEventListener(LOCAL_CART_UPDATED, handleLocalCartUpdate);
  }, []);

  const addItem = (input: AddItemVariables): Promise<void> => {
    const newCart = applyOptimisticAdd(localCartRef.current, input) ?? localCartRef.current;
    localCartRef.current = newCart;
    setLocalCart(newCart);
    saveLocalCart(newCart);
    return Promise.resolve();
  };

  const updateItem = (itemId: string, quantity: number): void => {
    const newCart = {
      ...localCartRef.current,
      items: localCartRef.current.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    };
    localCartRef.current = newCart;
    setLocalCart(newCart);
    saveLocalCart(newCart);
  };

  const removeItem = (itemId: string): Promise<void> => {
    const newCart = {
      ...localCartRef.current,
      items: localCartRef.current.items.filter((i) => i.id !== itemId),
    };
    localCartRef.current = newCart;
    setLocalCart(newCart);
    saveLocalCart(newCart);
    return Promise.resolve();
  };

  const clearCart = (): Promise<void> => {
    localCartRef.current = EMPTY_LOCAL_CART;
    setLocalCart(EMPTY_LOCAL_CART);
    clearLocalCart();
    return Promise.resolve();
  };

  const adaptedCart = useMemo(() => adaptCart(localCart), [localCart]);
  const items: CartDisplayItem[] = adaptedCart?.items ?? [];
  const { cartCount, subtotal } = calcCartTotals(items);

  return {
    // cartId is always null — checkout hook syncs localStorage to the API on demand
    cartId: null as string | null,
    items,
    cartCount,
    subtotal,
    total: subtotal,
    isLoading: !cartStorageReady,
    isMutating: false,
    addItemError: null,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };
}
