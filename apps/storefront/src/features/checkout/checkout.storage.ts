const SESSION_KEY = 'silver14-checkout-session';
const PENDING_COUPON_KEY = 'silver14-pending-coupon';

// ─── Checkout session ─────────────────────────────────────────────────────────

export const getCheckoutSessionId = (): string | null =>
  typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY) : null;

export const setCheckoutSessionId = (id: string): void => {
  sessionStorage.setItem(SESSION_KEY, id);
};

export const clearCheckoutSessionId = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

// ─── Pending coupon (entered at cart, applied at checkout init) ───────────────

export interface PendingCoupon {
  code: string;
  discountPreview: number;
  discountType: string;
  savingsLabel: string;
}

export const getPendingCoupon = (): PendingCoupon | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_COUPON_KEY);
    return raw ? (JSON.parse(raw) as PendingCoupon) : null;
  } catch {
    return null;
  }
};

export const setPendingCoupon = (coupon: PendingCoupon): void => {
  sessionStorage.setItem(PENDING_COUPON_KEY, JSON.stringify(coupon));
};

export const clearPendingCoupon = (): void => {
  sessionStorage.removeItem(PENDING_COUPON_KEY);
};
