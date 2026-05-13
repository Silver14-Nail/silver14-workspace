'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '@/MOCK_DATAS/products';

interface WishlistState {
  items: Product[];
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'TOGGLE_ITEM'; payload: Product };

const initialState: WishlistState = {
  items: [],
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.find((item) => item.id === action.payload.id)) {
        return state;
      }
      return { ...state, items: [...state.items, action.payload] };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case 'TOGGLE_ITEM': {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }

    default:
      return state;
  }
}

interface WishlistContextValue {
  state: WishlistState;
  dispatch: React.Dispatch<WishlistAction>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState, () => {
    try {
      const saved = localStorage.getItem('lunelle_wishlist');
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem('lunelle_wishlist', JSON.stringify(state));
  }, [state]);

  const isInWishlist = (productId: string): boolean => {
    return state.items.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    dispatch({ type: 'TOGGLE_ITEM', payload: product });
  };

  return (
    <WishlistContext.Provider value={{ state, dispatch, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
