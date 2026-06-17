import type { CustomerAuthTokens } from './customer-auth.types';

const STORAGE_KEY = 'silver14-customer-auth';

/** Safe accessor — returns null when localStorage is blocked (private browsing, WebView, etc.). */
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
    // Silently fail — storage blocked
  }
}

function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

export function getStoredCustomerTokens(): CustomerAuthTokens | null {
  if (typeof window === 'undefined') return null;
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerAuthTokens;
  } catch {
    clearStoredCustomerTokens();
    return null;
  }
}

export function setStoredCustomerTokens(tokens: CustomerAuthTokens) {
  safeSetItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredCustomerTokens() {
  if (typeof window !== 'undefined') {
    safeRemoveItem(STORAGE_KEY);
  }
}

export function isAccessTokenExpired(tokens: CustomerAuthTokens): boolean {
  try {
    const payloadB64 = tokens.accessToken.split('.')[1];
    const payload = JSON.parse(atob(payloadB64)) as { exp?: number };
    return typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}
