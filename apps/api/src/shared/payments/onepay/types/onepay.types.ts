/**
 * OnePAY Integration Types
 *
 * Reference: "Quy trinh tich hop cong thanh toan v2_2023.pdf" — ver 2.4
 *
 * Key rules:
 *  - Amount in API = VND * 100 (e.g. 25,000₫ → 2,500,000)
 *  - vpc_SecureHash = HMAC-SHA256 of sorted vpc_/user_ params, hex-encoded
 *  - Transaction is success only when vpc_TxnResponseCode === "0" AND hash matches
 */

// ─── Payment Request ──────────────────────────────────────────────────────────

export interface OnepayPaymentParams {
  /** Unique merchant transaction reference — must be unique per request */
  vpc_MerchTxnRef: string;
  /** Short order description / order ID */
  vpc_OrderInfo: string;
  /** Amount in VND * 100, no decimals (e.g. 2500000 for 25,000₫) */
  vpc_Amount: string;
  /** Customer IP address */
  vpc_TicketNo: string;
  /** Optional — card list filter: INTERNATIONAL | DOMESTIC | QR | BNPL | bank BIN */
  vpc_CardList?: string;
  /** Customer phone (optional) */
  vpc_Customer_Phone?: string;
  /** Customer email (optional) */
  vpc_Customer_Email?: string;
  /** Customer user ID (optional) */
  vpc_Customer_Id?: string;
  /** Page back link — merchant checkout page */
  AgainLink?: string;
}

// ─── Payment Response (Return URL + IPN) ────────────────────────────────────

export interface OnepayReturnParams {
  vpc_Command?: string;
  vpc_Locale?: string;
  vpc_CurrencyCode?: string;
  vpc_MerchTxnRef?: string;
  vpc_Merchant?: string;
  vpc_OrderInfo?: string;
  vpc_Amount?: string;
  /** "0" = success, all others = failure */
  vpc_TxnResponseCode?: string;
  /** Unique gateway transaction number */
  vpc_TransactionNo?: string;
  vpc_Message?: string;
  /** Card type: VC, MC, JC, AE, CUP, 6-digit BIN, or wallet ID */
  vpc_Card?: string;
  vpc_PayChannel?: string;
  vpc_CardUid?: string;
  vpc_CardNum?: string;
  vpc_CardHolderName?: string;
  vpc_SecureHash?: string;
  /** Allow any extra fields OnePAY may add */
  [key: string]: string | undefined;
}

// ─── QueryDR Request ─────────────────────────────────────────────────────────

export interface OnepayQueryDrRequest {
  vpc_MerchTxnRef: string;
}

// ─── QueryDR Response ────────────────────────────────────────────────────────

export interface OnepayQueryDrResponse {
  /** "Y" = transaction exists, "N" = does not exist */
  vpc_DRExists: string;
  /** "0" = success, "300" = pending, "100" = in progress, others = failed */
  vpc_TxnResponseCode: string;
  vpc_MerchTxnRef: string;
  vpc_Merchant: string;
  vpc_OrderInfo: string;
  vpc_Amount: string;
  vpc_TransactionNo: string;
  vpc_Message: string;
  vpc_Card?: string;
  vpc_PayChannel?: string;
  vpc_SecureHash?: string;
  [key: string]: string | undefined;
}

// ─── Response code constants ─────────────────────────────────────────────────

export const ONEPAY_SUCCESS_CODE = '0';
export const ONEPAY_PENDING_CODES = new Set(['100', '300']);

export const ONEPAY_RESPONSE_MESSAGES: Record<string, string> = {
  '0': 'Approved — transaction successful',
  '1': 'Unspecified failure in authorization',
  '2': 'Card Issuer declined to authorize',
  '3': 'Timed out — no response from Card Issuer',
  '4': 'Expired card',
  '5': 'Insufficient funds / credit limit',
  '6': 'Error communicating with bank',
  '7': 'System error',
  '8': 'Card Issuer does not support online payment',
  '9': 'Invalid card name',
  '10': 'Card expired or deactivated',
  '11': 'Card not registered for online payment',
  '12': 'Invalid card issue or expiry date',
  '13': 'Amount exceeds online payment limit',
  '14': 'Invalid card number',
  '21': 'Insufficient account balance',
  '22': 'Invalid account information',
  '23': 'Card / account blocked',
  '24': 'Invalid card / account information',
  '25': 'Invalid OTP',
  '26': 'OTP expired',
  '98': 'Authentication cancelled',
  '99': 'User cancelled transaction',
  B: 'Authentication failed (blocked)',
  D: 'Authentication failed (awaiting processing)',
  F: '3D Secure authentication failed',
  U: 'Card security code (CSC) authentication failed',
  Z: 'Transaction declined',
  '253': 'Session expired — payment time limit exceeded',
};
