export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  shape: string;
  length?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'stripe' | 'paypal';

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingCost: number;
  total: number;
  /** ISO 4217 currency code — snapshot of the currency at order time (e.g. 'USD', 'EUR') */
  currency: string;
  /** Exchange rate snapshot at order time; 1 if paid in USD */
  exchangeRate: number | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paypalOrderId?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  discountCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}
