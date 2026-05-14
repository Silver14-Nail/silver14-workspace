// ─── AUTH ───────────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  WHOLESALE = 'wholesale',
}

export enum AuthProviderName {
  PASSWORD = 'password',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  TIKTOK = 'tiktok',
}

export enum LoginMethod {
  PASSWORD = 'password',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  TIKTOK = 'tiktok',
}

// ─── PRODUCTS ───────────────────────────────────────────────────────────────

export enum ShapeSizeTier {
  STANDARD = 'standard',
  LONG = 'long',
  EXTRA_LONG = 'extra_long',
}

export enum PriceAdjustmentType {
  FIXED = 'fixed',
  PERCENT = 'percent',
}

export enum NailSizeLabel {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  CUSTOM = 'Custom',
}

// ─── COUPONS ────────────────────────────────────────────────────────────────

export enum DiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
}

export enum CouponRestrictionType {
  PRODUCT = 'product',
  SHAPE = 'shape',
  CATEGORY = 'category',
  MIN_QTY = 'min_qty',
  NEW_USER = 'new_user',
}

// ─── CARTS & CHECKOUT ───────────────────────────────────────────────────────

export enum CartStatus {
  ACTIVE = 'active',
  MERGED = 'merged',
  CONVERTED = 'converted',
  EXPIRED = 'expired',
}

export enum CheckoutStep {
  CONTACT = 1,
  SHIPPING = 2,
  PAYMENT = 3,
}

export enum CheckoutSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  EXPIRED = 'expired',
}

// ─── ORDERS ─────────────────────────────────────────────────────────────────

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// ─── PAYMENTS ───────────────────────────────────────────────────────────────

export enum PaymentGateway {
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BRAINTREE = 'braintree',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
}

export enum CardProcessor {
  STRIPE = 'stripe',
  BRAINTREE = 'braintree',
}

// ─── WHOLESALE ──────────────────────────────────────────────────────────────

export enum WholesaleEnquiryStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum WholesaleTierName {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
}

export enum WholesalePaymentTerms {
  PREPAID = 'prepaid',
  NET_30 = 'net30',
  NET_60 = 'net60',
}

export enum WholesalePaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

// ─── NEWSLETTER ─────────────────────────────────────────────────────────────

export enum NewsletterStatus {
  ACTIVE = 'active',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum NewsletterSource {
  FOOTER = 'footer',
  CHECKOUT = 'checkout',
  POPUP = 'popup',
  WHOLESALE_PAGE = 'wholesale_page',
}
