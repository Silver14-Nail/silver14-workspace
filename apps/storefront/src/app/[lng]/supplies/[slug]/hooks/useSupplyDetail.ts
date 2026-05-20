import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupplyBySlug } from '@/MOCK_DATAS/supplies';
import { useCart } from '@/hooks/useCart';
import type { CartItem } from '@/hooks/useCart';
import type { StorefrontProduct } from '@/types/product';

export function useSupplyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { dispatch, cartCount, subtotal } = useCart();

  const supply = getSupplyBySlug(slug ?? '');

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  const handleAddToCart = useCallback(() => {
    if (!supply || !supply.inStock) return;

    const cartProduct: StorefrontProduct = {
      id: supply.id,
      name: supply.name,
      slug: supply.slug,
      price: supply.price,
      salePrice: null,
      currency: 'USD',
      thumbnail: supply.images[0] ?? null,
      isNew: false,
      isBestSeller: false,
      inStock: supply.inStock,
    };

    const item: CartItem = {
      product: cartProduct,
      size: '',
      shape: '',
      quantity,
    };

    dispatch({ type: 'ADD_ITEM', payload: item });
    setLastAddedItem(item);
    setShowCartPreview(true);
  }, [supply, quantity, dispatch]);

  return {
    supply,
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    showCartPreview,
    setShowCartPreview,
    lastAddedItem,
    cartCount,
    subtotal,
    handleAddToCart,
    router,
  };
}
