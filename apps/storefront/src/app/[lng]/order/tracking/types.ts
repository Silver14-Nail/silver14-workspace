export type OrderTrackingStatus = 'Processing' | 'Crafting' | 'Shipped' | 'Delivered';

export interface TrackedOrderItem {
  productName: string;
  sizeName: string | null;
  shapeName: string | null;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface TrackedOrderAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface TrackedOrder {
  id: string;
  status: OrderTrackingStatus;
  createdAt: string;
  items: TrackedOrderItem[];
  total: number;
  shippingAddress: TrackedOrderAddress;
}

export interface TrackingFormData {
  orderId: string;
  phone: string;
}

export type TrackingResult = TrackedOrder | null | undefined;
