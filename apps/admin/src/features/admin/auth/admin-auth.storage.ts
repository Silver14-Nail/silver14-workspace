import type { AdminAuthTokens } from './admin-auth.types';

const STORAGE_KEY = 'silver14-admin-auth';

export function getStoredTokens(): AdminAuthTokens | null {
  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AdminAuthTokens;
  } catch {
    clearStoredTokens();
    return null;
  }
}

export function setStoredTokens(tokens: AdminAuthTokens) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens() {
  window.localStorage.removeItem(STORAGE_KEY);
}
