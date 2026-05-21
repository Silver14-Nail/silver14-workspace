const getBase = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountType?: 'percent' | 'fixed' | 'free_shipping';
  discountValue?: number;
  discountPreview?: number;
  savingsLabel?: string;
  message: string;
}

export async function validateCoupon(
  code: string,
  cartId: string,
  accessToken?: string | null,
): Promise<CouponValidationResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${getBase()}/client-api/coupons/validate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code: code.toUpperCase().trim(), cartId }),
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({ message: 'Network error' }));

  if (!res.ok) {
    throw new Error(typeof data?.message === 'string' ? data.message : `Error ${res.status}`);
  }

  return data as CouponValidationResult;
}
