import { MockOrder } from '@/context/CartContext';

export interface TrackingFormData {
  orderId: string;
  phone: string;
}

export type TrackingResult = MockOrder | null | undefined;
