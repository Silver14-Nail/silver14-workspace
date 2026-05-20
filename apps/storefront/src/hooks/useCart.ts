'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cartActions } from '@/store/slices/cart.slice';
import { DISCOUNT_CODES } from '@/config/commerce.config';
import { addStoredOrder, findStoredOrder } from '@/context/orders.storage';

export type { CartItem, MockOrder, CartState } from '@/store/slices/cart.slice';

type CartAction =
  | { type: 'ADD_ITEM'; payload: import('@/store/slices/cart.slice').CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string; shape: string } }
  | {
      type: 'UPDATE_QUANTITY';
      payload: { productId: string; size: string; shape: string; quantity: number };
    }
  | { type: 'APPLY_DISCOUNT'; payload: { code: string; rate: number } }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'CLEAR_CART' };

export function useCart() {
  const dispatch = useAppDispatch();
  const { items, discountCode, discountRate } = useAppSelector((s) => s.cart);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.salePrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  const compatDispatch = useCallback(
    (action: CartAction) => {
      switch (action.type) {
        case 'ADD_ITEM':
          dispatch(cartActions.addItem(action.payload));
          break;
        case 'REMOVE_ITEM':
          dispatch(cartActions.removeItem(action.payload));
          break;
        case 'UPDATE_QUANTITY':
          dispatch(cartActions.updateQuantity(action.payload));
          break;
        case 'APPLY_DISCOUNT':
          dispatch(cartActions.applyDiscount(action.payload));
          break;
        case 'REMOVE_DISCOUNT':
          dispatch(cartActions.removeDiscount());
          break;
        case 'CLEAR_CART':
          dispatch(cartActions.clearCart());
          break;
      }
    },
    [dispatch],
  );

  const applyDiscount = useCallback(
    (code: string): boolean => {
      const upper = code.toUpperCase();
      const rate = DISCOUNT_CODES[upper] ?? null;
      if (rate) {
        dispatch(cartActions.applyDiscount({ code: upper, rate }));
        return true;
      }
      return false;
    },
    [dispatch],
  );

  return {
    state: { items, discountCode, discountRate },
    dispatch: compatDispatch,
    cartCount,
    subtotal,
    discountAmount,
    total,
    applyDiscount,
    addOrder: addStoredOrder,
    getOrder: findStoredOrder,
  };
}
