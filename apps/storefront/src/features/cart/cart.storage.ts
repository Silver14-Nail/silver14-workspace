const GUEST_CART_KEY = 'silver14-guest-cart-id';

export function getGuestCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(GUEST_CART_KEY);
}

export function setGuestCartId(cartId: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GUEST_CART_KEY, cartId);
  }
}

export function clearGuestCartId(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(GUEST_CART_KEY);
  }
}
