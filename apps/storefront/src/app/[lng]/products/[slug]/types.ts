import type { CartItem } from '@/context/CartContext';

export interface ProductSelections {
  shape: string;
  size: string;
  customization: string;
  quantity: number;
}

export type AccordionKey = 'description' | 'nail-method' | 'shipping';

export type { CartItem };
