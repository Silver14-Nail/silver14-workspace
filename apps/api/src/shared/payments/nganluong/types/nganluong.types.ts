/**
 * Ngân Lượng API v3.1 type definitions.
 */

// ─── SetExpressCheckout Request ───────────────────────────────────────────

export interface NgLuongCreateOrderParams {
  orderCode: string;
  totalAmount: number;
  paymentMethod: string;
  bankCode: string;
  orderDescription?: string;
  buyerFullname: string;
  buyerEmail: string;
  buyerMobile: string;
  buyerAddress?: string;
  curCode?: 'vnd' | 'usd';
  langCode?: 'vi' | 'en';
  timeLimit?: number; // minutes
}

export interface NgLuongCreateOrderResponse {
  error_code: string;
  token: string;
  description: string;
  time_limit: number;
  checkout_url: string;
}

// ─── Order Check Response ─────────────────────────────────────────────────

export interface NgLuongOrderData {
  token: string;
  transaction_status: string; // '00' = success, '01' = unpaid, '02' = processing, '03' = pending
  transaction_id: string | number;
  receiver_email: string;
  order_code: string;
  total_amount: number;
  payment_method: string;
  bank_code: string;
  order_description: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  buyer_fullname: string;
  buyer_email: string;
  buyer_mobile: string;
  buyer_address: string;
  affiliate_code: string;
}

export interface NgLuongOrderCheckResponse {
  error_code: string;
  data: NgLuongOrderData;
}

// ─── Notify / Return URL Callback Params ───────────────────────────────────

export interface NgLuongCallbackParams {
  error_code: string;
  token: string;
  order_code: string;
  order_id?: string;
  buyer_fullname?: string;
  buyer_email?: string;
  buyer_mobile?: string;
}
