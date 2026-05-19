import type { CartItem } from '@/hooks/useCart';

export interface ProductSelections {
  shape: string;
  size: string;
  customization: string;
  quantity: number;
}

export type AccordionKey = 'description' | 'nail-method' | 'shipping' | 'includes';

export type { CartItem };
