'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { wishlistActions } from '@/store/slices/wishlist.slice';
import type { StorefrontProduct } from '@/types/product';

export function useWishlist() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.wishlist.items);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items],
  );

  const toggleWishlist = useCallback(
    (product: StorefrontProduct) => {
      dispatch(wishlistActions.toggleWishlist(product));
    },
    [dispatch],
  );

  return {
    state: { items },
    dispatch,
    isInWishlist,
    toggleWishlist,
    items,
  };
}
