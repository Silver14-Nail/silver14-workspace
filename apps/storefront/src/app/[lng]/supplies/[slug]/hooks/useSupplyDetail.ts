'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import type { ApiProductDetail, ApiVariant } from '@/lib/products.api';
import type { CartPreviewItem } from '@/features/cart/cart.types';

export interface UseSupplyDetailResult {
  supply: ApiProductDetail | null;
  selectedImage: number;
  setSelectedImage: (i: number) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  showCartPreview: boolean;
  setShowCartPreview: (v: boolean) => void;
  lastAddedItem: CartPreviewItem | null;
  handleAddToCart: () => void;
  inStock: boolean;
  maxQuantity: number;
  stockExceeded: boolean;
  selectedVariant: ApiVariant | null;
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string | null) => void;
  hasColorVariants: boolean;
}

export function useSupplyDetail(supply: ApiProductDetail | null): UseSupplyDetailResult {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartPreviewItem | null>(null);
  const [selectedVariantId, setSelectedVariantIdRaw] = useState<string | null>(
    supply?.variants?.[0]?.id ?? null,
  );

  const { addItem, cartCount, subtotal } = useCart();

  // Reset state on product navigation
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedVariantIdRaw(supply?.variants?.[0]?.id ?? null);
  }, [supply?.id]);

  const selectedVariant =
    (selectedVariantId
      ? supply?.variants?.find((v) => v.id === selectedVariantId)
      : supply?.variants?.[0]) ?? null;

  const hasColorVariants =
    (supply?.variants?.length ?? 0) > 1 ||
    (supply?.variants?.[0]?.colorName != null && supply!.variants[0].colorName !== '');

  const inStock = (selectedVariant?.stockQty ?? 0) > 0 && (selectedVariant?.isAvailable ?? false);
  const maxQuantity = inStock ? (selectedVariant?.stockQty ?? 0) : 0;
  const stockExceeded = inStock && quantity > maxQuantity;

  // Switching variant resets quantity to avoid carrying over an exceeded value
  const setSelectedVariantId = useCallback((id: string | null) => {
    setSelectedVariantIdRaw(id);
    setQuantity(1);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!supply || !selectedVariant || !inStock || stockExceeded) return;

    const thumbnail =
      supply.images?.find((img) => img.isMain)?.url ?? supply.images?.[0]?.url ?? null;
    const price = parseFloat(selectedVariant.computedPrice);

    setLastAddedItem({
      productName: supply.name,
      thumbnail,
      shapeName: '',
      sizeName: '',
      colorName: selectedVariant.colorName ?? null,
      price,
      quantity,
      previewCartCount: cartCount + quantity,
      previewSubtotal: subtotal + price * quantity,
    });
    setShowCartPreview(true);

    try {
      await addItem({ variantId: selectedVariant.id, quantity });
    } catch {
      setShowCartPreview(false);
    }
  }, [supply, selectedVariant, inStock, stockExceeded, quantity, addItem, cartCount, subtotal]);

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
    inStock,
    maxQuantity,
    stockExceeded,
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,
    hasColorVariants,
  };
}
