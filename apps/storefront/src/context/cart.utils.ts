import { DISCOUNT_CODES } from '../MOCK_DATAS/products';
import type { CartItem, CartState, MockOrder } from './CartContext';

const CART_STORAGE_KEY = 'lunelle_cart';
const ORDERS_STORAGE_KEY = 'lunelle_orders';

const isSameCartItem = (
  item: CartItem,
  target: { productId: string; size: string; shape: string; length: string },
) =>
  item.product.id === target.productId &&
  item.size === target.size &&
  item.shape === target.shape &&
  item.length === target.length;

export const getCartItemCount = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

export const getCartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => {
    const price = item.product.salePrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

export const getDiscountRate = (code: string) => DISCOUNT_CODES[code.toUpperCase()] ?? null;

export const removeCartItem = (
  items: CartItem[],
  target: { productId: string; size: string; shape: string; length: string },
) => items.filter((item) => !isSameCartItem(item, target));

export const readCartState = (initialState: CartState): CartState => {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  } catch {
    return initialState;
  }
};

export const writeCartState = (state: CartState) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
};

export const addStoredOrder = (order: MockOrder) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([...existing, order]));
  } catch {
    return;
  }
};

export const findStoredOrder = (orderId: string, phone: string): MockOrder | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const orders: MockOrder[] = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
    return orders.find((order) => order.id === orderId && order.phone === phone) || null;
  } catch {
    return null;
  }
};
