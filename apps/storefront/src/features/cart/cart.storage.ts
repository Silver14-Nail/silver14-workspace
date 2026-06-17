const GUEST_CART_KEY = 'silver14-guest-cart-id';

/** Wrapped in try-catch for private browsing / restricted WebViews where
 *  localStorage throws SecurityError. Falls back to null on failure. */
function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Silently fail — storage blocked (private browsing, WebView, etc.)
  }
}

function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

export function getGuestCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return safeGetItem(GUEST_CART_KEY);
}

export function setGuestCartId(cartId: string): void {
  if (typeof window !== 'undefined') {
    safeSetItem(GUEST_CART_KEY, cartId);
  }
}

export function clearGuestCartId(): void {
  if (typeof window !== 'undefined') {
    safeRemoveItem(GUEST_CART_KEY);
  }
}
