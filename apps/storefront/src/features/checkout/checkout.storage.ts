const KEY = 'silver14-checkout-session';

export const getCheckoutSessionId = (): string | null =>
  typeof window !== 'undefined' ? sessionStorage.getItem(KEY) : null;

export const setCheckoutSessionId = (id: string): void => {
  sessionStorage.setItem(KEY, id);
};

export const clearCheckoutSessionId = (): void => {
  sessionStorage.removeItem(KEY);
};
