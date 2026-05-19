import { MockOrder } from '@/hooks/useCart';

export interface TrackingFormData {
  orderId: string;
  phone: string;
}

export type TrackingResult = MockOrder | null | undefined;
