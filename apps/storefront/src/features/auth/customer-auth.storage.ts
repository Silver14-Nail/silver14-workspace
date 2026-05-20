import type { CustomerAuthTokens } from './customer-auth.types';

const STORAGE_KEY = 'silver14-customer-auth';

export function getStoredCustomerTokens(): CustomerAuthTokens | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerAuthTokens;
  } catch {
    clearStoredCustomerTokens();
    return null;
  }
}

export function setStoredCustomerTokens(tokens: CustomerAuthTokens) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredCustomerTokens() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
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
