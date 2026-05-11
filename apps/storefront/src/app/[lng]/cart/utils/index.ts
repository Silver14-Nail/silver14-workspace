import { CartItemType } from '../types';

export const toItemKey = (item: CartItemType) => ({
  productId: item.product.id,
  size: item.size,
  shape: item.shape,
  length: item.length,
});
