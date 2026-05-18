import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupplyBySlug } from '@/MOCK_DATAS/supplies';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import type { Product } from '@/MOCK_DATAS/products';

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

    const cartProduct: Product = {
      ...supply,
      salePrice: undefined,
      collection: 'Supplies',
      material: '',
      isNew: false,
      isBestSeller: false,
      availableSizes: [],
      availableShapes: [],
      availableLengths: [],
      processingTime: '',
      tags: [],
      rating: 0,
      reviewCount: 0,
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
