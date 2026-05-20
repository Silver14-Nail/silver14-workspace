import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { StorefrontProduct } from '@/types/product';

export interface WishlistState {
  items: StorefrontProduct[];
}

const initialState: WishlistState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<StorefrontProduct>) {
      if (!state.items.find((i) => i.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    toggleWishlist(state, action: PayloadAction<StorefrontProduct>) {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const wishlistActions = wishlistSlice.actions;
export default wishlistSlice.reducer;
