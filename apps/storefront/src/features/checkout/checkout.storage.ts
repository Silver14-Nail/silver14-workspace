const SESSION_KEY = 'silver14-checkout-session';
const STEP_KEY = 'silver14-checkout-step';
const PENDING_COUPON_KEY = 'silver14-pending-coupon';

/** Safe sessionStorage accessor — returns null when storage is blocked. */
function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Silently fail — storage blocked
  }
}

function safeSessionRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

// ─── Checkout session ─────────────────────────────────────────────────────────

export const getCheckoutSessionId = (): string | null =>
  typeof window !== 'undefined' ? safeSessionGet(SESSION_KEY) : null;

export const setCheckoutSessionId = (id: string): void => {
  safeSessionSet(SESSION_KEY, id);
};

export const clearCheckoutSessionId = (): void => {
  safeSessionRemove(SESSION_KEY);
  safeSessionRemove(STEP_KEY);
};

// ─── Checkout step ────────────────────────────────────────────────────────────

type CheckoutStep = 'contact' | 'shipping' | 'payment' | 'confirmation';

export const getCheckoutStep = (): CheckoutStep | null => {
  if (typeof window === 'undefined') return null;
  const v = safeSessionGet(STEP_KEY);
  return (v as CheckoutStep) ?? null;
};

export const setCheckoutStep = (step: CheckoutStep): void => {
  safeSessionSet(STEP_KEY, step);
};

export const clearCheckoutStep = (): void => {
  safeSessionRemove(STEP_KEY);
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
    const raw = safeSessionGet(PENDING_COUPON_KEY);
    return raw ? (JSON.parse(raw) as PendingCoupon) : null;
  } catch {
    return null;
  }
};

export const setPendingCoupon = (coupon: PendingCoupon): void => {
  safeSessionSet(PENDING_COUPON_KEY, JSON.stringify(coupon));
};

export const clearPendingCoupon = (): void => {
  safeSessionRemove(PENDING_COUPON_KEY);
};
