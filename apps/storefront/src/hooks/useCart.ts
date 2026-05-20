// Central re-export — all cart state now lives in the real backend API via React Query
export { useCart } from '@/features/cart/cart.hooks';
export type { CartDisplayItem, CartPreviewItem } from '@/features/cart/cart.types';
