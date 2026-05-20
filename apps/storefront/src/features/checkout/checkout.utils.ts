import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '@/config/commerce.config';

export type ContactDetails = {
  email: string;
  phone: string;
  createAccount: boolean;
  password: string;
};

export type ShippingDetails = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
};

export type PaymentMethod = 'paypal' | 'card';

export { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST };

export const getShippingCost = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
