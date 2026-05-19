import type { MockOrder } from '@/store/slices/cart.slice';

const ORDERS_KEY = 'lunelle_orders';

export const addStoredOrder = (order: MockOrder): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing: MockOrder[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    localStorage.setItem(ORDERS_KEY, JSON.stringify([...existing, order]));
  } catch {
    return;
  }
};

export const findStoredOrder = (orderId: string, phone: string): MockOrder | null => {
  if (typeof window === 'undefined') return null;
  try {
    const orders: MockOrder[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    return orders.find((o) => o.id === orderId && o.phone === phone) ?? null;
  } catch {
    return null;
  }
};
