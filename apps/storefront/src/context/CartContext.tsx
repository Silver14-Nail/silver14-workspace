'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '../MOCK_DATAS/products';
import {
  addStoredOrder,
  findStoredOrder,
  getCartItemCount,
  getCartSubtotal,
  getDiscountRate,
  readCartState,
  removeCartItem,
  writeCartState,
} from './cart.utils';

export interface CartItem {
  product: Product;
  size: string;
  shape: string;
  length: string;
  quantity: number;
}

export interface MockOrder {
  id: string;
  phone: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Crafting';
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
}

export interface CartState {
  items: CartItem[];
  discountCode: string | null;
  discountRate: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | {
      type: 'REMOVE_ITEM';
      payload: { productId: string; size: string; shape: string; length: string };
    }
  | {
      type: 'UPDATE_QUANTITY';
      payload: { productId: string; size: string; shape: string; length: string; quantity: number };
    }
  | { type: 'APPLY_DISCOUNT'; payload: { code: string; rate: number } }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  discountCode: null,
  discountRate: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.findIndex(
        (i) =>
          i.product.id === action.payload.product.id &&
          i.size === action.payload.size &&
          i.shape === action.payload.shape &&
          i.length === action.payload.length,
      );
      if (existing !== -1) {
        const updated = [...state.items];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + action.payload.quantity,
        };
        return { ...state, items: updated };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: removeCartItem(state.items, action.payload),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: removeCartItem(state.items, action.payload),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.payload.productId &&
          i.size === action.payload.size &&
          i.shape === action.payload.shape &&
          i.length === action.payload.length
            ? { ...i, quantity: action.payload.quantity }
            : i,
        ),
      };
    }
    case 'APPLY_DISCOUNT':
      return { ...state, discountCode: action.payload.code, discountRate: action.payload.rate };
    case 'REMOVE_DISCOUNT':
      return { ...state, discountCode: null, discountRate: 0 };
    case 'CLEAR_CART':
      return { ...initialState };
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  applyDiscount: (code: string) => boolean;
  addOrder: (order: MockOrder) => void;
  getOrder: (orderId: string, phone: string) => MockOrder | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, readCartState);

  useEffect(() => {
    writeCartState(state);
  }, [state]);

  const cartCount = getCartItemCount(state.items);
  const subtotal = getCartSubtotal(state.items);
  const discountAmount = subtotal * state.discountRate;
  const total = subtotal - discountAmount;

  const applyDiscount = (code: string): boolean => {
    const upper = code.toUpperCase();
    const rate = getDiscountRate(upper);

    if (rate) {
      dispatch({ type: 'APPLY_DISCOUNT', payload: { code: upper, rate } });
      return true;
    }

    return false;
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        cartCount,
        subtotal,
        discountAmount,
        total,
        applyDiscount,
        addOrder: addStoredOrder,
        getOrder: findStoredOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
