import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupplyBySlug } from '@/MOCK_DATAS/supplies';
import type { CartPreviewItem } from '@/hooks/useCart';

export function useSupplyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const supply = getSupplyBySlug(slug ?? '');

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartPreviewItem | null>(null);

  // Supplies are mock products without real DB variants.
  // Preview shows UI feedback; real cart integration pending supply product setup in DB.
  const handleAddToCart = useCallback(() => {
    if (!supply || !supply.inStock) return;
    const preview: CartPreviewItem = {
      productName: supply.name,
      thumbnail: supply.images[0] ?? null,
      shapeName: '',
      sizeName: '',
      price: supply.price,
      quantity,
    };
    setLastAddedItem(preview);
    setShowCartPreview(true);
  }, [supply, quantity]);

  return {
    supply,
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    showCartPreview,
    setShowCartPreview,
    lastAddedItem,
    handleAddToCart,
    router,
  };
}
