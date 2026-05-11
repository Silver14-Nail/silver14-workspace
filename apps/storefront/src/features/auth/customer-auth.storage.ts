import type { CustomerAuthTokens } from './customer-auth.types';

const STORAGE_KEY = 'silver14-customer-auth';

export function getStoredCustomerTokens(): CustomerAuthTokens | null {
  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CustomerAuthTokens;
  } catch {
    clearStoredCustomerTokens();
    return null;
  }
}

export function setStoredCustomerTokens(tokens: CustomerAuthTokens) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredCustomerTokens() {
  window.localStorage.removeItem(STORAGE_KEY);
}
