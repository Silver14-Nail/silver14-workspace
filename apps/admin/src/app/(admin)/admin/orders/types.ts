export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export type PaymentGateway = 'paypal' | 'stripe' | 'braintree';

export interface OrderUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface ContactSnapshot {
  email: string;
  phone: string;
  fullName: string;
}

export interface ShippingSnapshot {
  recipientName: string;
  street: string;
  city: string;
  country: string;
  postalCode?: string;
  shippingMethodName: string;
}

export interface OrderVariant {
  id: string;
  sku: string | null;
  computedPrice: number;
  shape?: { id: string; name: string };
  size?: { id: string; label: string; sizeCode: string };
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  shapeSurcharge: number;
  itemDiscount: number;
  shapeName: string;
  sizeLabel: string;
  isCustomSize: boolean;
  variant: OrderVariant;
  customSizeRequest?: {
    thumb: string | null;
    index_finger: string | null;
    middle_finger: string | null;
    ring_finger: string | null;
    pinky: string | null;
    notes: string | null;
  } | null;
}

export interface PaypalDetail {
  paypalOrderId: string;
  payerEmail: string | null;
  payerId: string | null;
  captureId: string | null;
}

export interface CardDetail {
  processor: string;
  last4: string;
  brand: string;
  chargeId: string;
}

export interface Payment {
  id: string;
  gateway: PaymentGateway;
  gatewayTxnId: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt: string | null;
  paypalDetail: PaypalDetail | null;
  cardDetail: CardDetail | null;
}

export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string | null;
  fee: number;
}

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  carrier: string | null;
  trackingNumber: string | null;
  internalNotes: string | null;
  contactSnapshot: ContactSnapshot;
  shippingSnapshot: ShippingSnapshot;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  user: OrderUser | null;
  shippingMethod: ShippingMethod | null;
  items: OrderItem[];
  payment: Payment | null;
}

export interface OrderListItem {
  id: string;
  status: OrderStatus;
  carrier: string | null;
  trackingNumber: string | null;
  contactSnapshot: ContactSnapshot;
  shippingSnapshot: ShippingSnapshot;
  total: number;
  currency: string;
  createdAt: string;
  user: OrderUser | null;
  payment?: Pick<Payment, 'status' | 'gateway' | 'amount'> | null;
}

export interface Pagination {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface OrderListResponse {
  items: OrderListItem[];
  pagination: Pagination;
}

export interface OrderStats {
  counts: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}
