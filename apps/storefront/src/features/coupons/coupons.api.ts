import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const http = axios.create({ baseURL: BASE, withCredentials: true });

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
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const { data } = await http.post<CouponValidationResult>(
    '/client-api/coupons/validate',
    { code: code.toUpperCase().trim(), cartId },
    { headers },
  );
  return data;
}
