export const FREE_SHIPPING_THRESHOLD = 50;
export const PAYMENT_METHODS = ['Visa', 'Mastercard', 'PayPal'] as const;

export interface CartItemType {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnail: string | null;
  };
  size: string;
  shape: string;
  length?: string;
  quantity: number;
}
