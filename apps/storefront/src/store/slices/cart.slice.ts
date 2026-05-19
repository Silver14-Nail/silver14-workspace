import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/MOCK_DATAS/products';

export interface CartItem {
  product: Product;
  size: string;
  shape: string;
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

const initialState: CartState = {
  items: [],
  discountCode: null,
  discountRate: 0,
};

const isSameItem = (item: CartItem, productId: string, size: string, shape: string) =>
  item.product.id === productId && item.size === size && item.shape === shape;

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const idx = state.items.findIndex((i) =>
        isSameItem(i, action.payload.product.id, action.payload.size, action.payload.shape),
      );
      if (idx !== -1) {
        state.items[idx].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<{ productId: string; size: string; shape: string }>) {
      const { productId, size, shape } = action.payload;
      state.items = state.items.filter((i) => !isSameItem(i, productId, size, shape));
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; size: string; shape: string; quantity: number }>,
    ) {
      const { productId, size, shape, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => !isSameItem(i, productId, size, shape));
      } else {
        const item = state.items.find((i) => isSameItem(i, productId, size, shape));
        if (item) item.quantity = quantity;
      }
    },
    applyDiscount(state, action: PayloadAction<{ code: string; rate: number }>) {
      state.discountCode = action.payload.code;
      state.discountRate = action.payload.rate;
    },
    removeDiscount(state) {
      state.discountCode = null;
      state.discountRate = 0;
    },
    clearCart(state) {
      state.items = [];
      state.discountCode = null;
      state.discountRate = 0;
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;
