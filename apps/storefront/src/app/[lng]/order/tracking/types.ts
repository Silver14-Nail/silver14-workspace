export type OrderTrackingStatus = 'Processing' | 'Crafting' | 'Shipped' | 'Delivered';

export interface TrackedOrderItem {
  productName: string;
  variantName: string | null;
  colorName: string | null;
  sizeName: string | null;
  shapeName: string | null;
  quantity: number;
  price: number;
  lineTotal: number;
  thumbnail: string | null;
}

export interface TrackedOrderAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethodName: string | null;
}

export interface TrackedOrder {
  id: string;
  status: OrderTrackingStatus;
  createdAt: string;
  currency: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode: string | null;
  total: number;
  items: TrackedOrderItem[];
  shippingAddress: TrackedOrderAddress;
}

export interface TrackingFormData {
  orderId: string;
  phone: string;
}

export type TrackingResult = TrackedOrder | null | undefined;
