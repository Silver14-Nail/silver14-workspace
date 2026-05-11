import type { CartItem, MockOrder } from '@/context/CartContext';

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

export const FREE_SHIPPING_THRESHOLD = 50;
export const STANDARD_SHIPPING_COST = 9.99;

export const getShippingCost = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;

export const generateOrderId = () =>
  `LNL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

export const createMockOrder = ({
  id,
  contact,
  shipping,
  payment,
  items,
  subtotal,
  discount,
  total,
}: {
  id: string;
  contact: ContactDetails;
  shipping: ShippingDetails;
  payment: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}): MockOrder => ({
  id,
  phone: contact.phone,
  email: contact.email,
  items,
  subtotal,
  discount,
  total,
  status: 'Processing',
  createdAt: new Date().toISOString(),
  shippingAddress: {
    firstName: shipping.firstName,
    lastName: shipping.lastName,
    address: shipping.address,
    city: shipping.city,
    postalCode: shipping.postalCode,
    country: shipping.country,
  },
  paymentMethod: payment === 'card' ? 'Visa/Mastercard' : 'PayPal',
});
