import type { ApiCart } from './cart.types';

const GUEST_CART_KEY = 'silver14-guest-cart-id';
const LOCAL_CART_KEY = 'silver14-local-cart';

// ─── Custom events ────────────────────────────────────────────────────────────

// Dispatched whenever a new guestCartId is written (from any context, including
// MutationCache.onSuccess). All useCart() instances listen so they can switch
// their queryKey to the new cartId.
export const GUEST_CART_ID_UPDATED = 'silver14:guestCartIdUpdated';

// Dispatched whenever the localStorage cart is written or cleared.
// All useCart() instances listen so the Navbar badge, cart page, etc. update
// immediately without needing an API roundtrip.
export const LOCAL_CART_UPDATED = 'silver14:localCartUpdated';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Guest cart ID ────────────────────────────────────────────────────────────

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

// Writes the cartId to localStorage AND dispatches GUEST_CART_ID_UPDATED so
// every live useCart() instance (Navbar, cart page, etc.) updates its local
// guestCartId state. Without this, each instance only reads localStorage once
// on mount and would keep using queryKey ['cart','guest','none'] even after the
// first add creates a real cartId — causing subsequent cache writes to land on
// a key no observer reads.
export function broadcastGuestCartId(cartId: string): void {
  setGuestCartId(cartId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<{ cartId: string }>(GUEST_CART_ID_UPDATED, { detail: { cartId } }),
    );
  }
}

// ─── Local cart (localStorage) ───────────────────────────────────────────────

export const EMPTY_LOCAL_CART: ApiCart = {
  id: 'local',
  status: 'ACTIVE',
  expiresAt: null,
  items: [],
};

export function getLocalCart(): ApiCart {
  if (typeof window === 'undefined') return EMPTY_LOCAL_CART;
  try {
    const raw = safeGetItem(LOCAL_CART_KEY);
    if (raw) return JSON.parse(raw) as ApiCart;
  } catch {}
  return EMPTY_LOCAL_CART;
}

// Writes cart to localStorage and broadcasts LOCAL_CART_UPDATED so every
// useCart() instance (Navbar, cart page, etc.) re-renders with the new data.
export function saveLocalCart(cart: ApiCart): void {
  if (typeof window === 'undefined') return;
  safeSetItem(LOCAL_CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(
    new CustomEvent<{ cart: ApiCart }>(LOCAL_CART_UPDATED, { detail: { cart } }),
  );
}

export function clearLocalCart(): void {
  if (typeof window === 'undefined') return;
  safeRemoveItem(LOCAL_CART_KEY);
  window.dispatchEvent(
    new CustomEvent<{ cart: ApiCart }>(LOCAL_CART_UPDATED, { detail: { cart: EMPTY_LOCAL_CART } }),
  );
}
