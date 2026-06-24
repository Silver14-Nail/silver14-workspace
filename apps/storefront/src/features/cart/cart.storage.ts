const GUEST_CART_KEY = 'silver14-guest-cart-id';

// Custom event dispatched whenever the guestCartId is written (from any context —
// including MutationCache.onSuccess which runs outside React component lifecycle).
// All useCart() instances listen for this event to synchronise their local
// guestCartId state, which drives the queryKey used by useQuery.
export const GUEST_CART_ID_UPDATED = 'silver14:guestCartIdUpdated';

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

// Writes the cartId to localStorage AND dispatches GUEST_CART_ID_UPDATED so
// every live useCart() instance (Navbar, cart page, etc.) updates its local
// guestCartId state. Without this, each instance only reads localStorage once
// on mount and would keep using queryKey ['cart','guest','none'] even after the
// first add creates a real cartId — causing subsequent cache writes (from the
// global MutationCache.onSuccess handler) to land on a key no observer reads.
export function broadcastGuestCartId(cartId: string): void {
  setGuestCartId(cartId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<{ cartId: string }>(GUEST_CART_ID_UPDATED, { detail: { cartId } }),
    );
  }
}

export function clearGuestCartId(): void {
  if (typeof window !== 'undefined') {
    safeRemoveItem(GUEST_CART_KEY);
  }
}
