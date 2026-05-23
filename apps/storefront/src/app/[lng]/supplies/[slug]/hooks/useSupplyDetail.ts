'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { fetchSupplyBySlug, type ApiProductDetail, type ApiVariant } from '@/lib/products.api';
import { useCart } from '@/hooks/useCart';
import type { CartPreviewItem } from '@/features/cart/cart.types';

export interface UseSupplyDetailResult {
  supply: ApiProductDetail | null;
  loading: boolean;
  error: string | null;
  selectedImage: number;
  setSelectedImage: (i: number) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  showCartPreview: boolean;
  setShowCartPreview: (v: boolean) => void;
  lastAddedItem: CartPreviewItem | null;
  handleAddToCart: () => void;
  inStock: boolean;
  selectedVariant: ApiVariant | null;
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string | null) => void;
  hasColorVariants: boolean;
}

export function useSupplyDetail(locale?: string): UseSupplyDetailResult {
  const { slug } = useParams<{ slug: string }>();

  const [supply, setSupply] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartPreviewItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSupplyBySlug(slug, locale)
      .then((data) => {
        if (cancelled) return;
        setSupply(data);
        setSelectedVariantId(data.variants?.[0]?.id ?? null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, locale]);

  const selectedVariant =
    (selectedVariantId
      ? supply?.variants?.find((v) => v.id === selectedVariantId)
      : supply?.variants?.[0]) ?? null;

  const hasColorVariants =
    (supply?.variants?.length ?? 0) > 1 ||
    (supply?.variants?.[0]?.colorName != null && supply.variants[0].colorName !== '');

  const inStock = (selectedVariant?.stockQty ?? 0) > 0 && (selectedVariant?.isAvailable ?? false);

  const handleAddToCart = useCallback(async () => {
    if (!supply || !selectedVariant || !inStock) return;

    const thumbnail = supply.images?.find((img) => img.isMain)?.url ?? supply.images?.[0]?.url ?? null;

    try {
      await addItem({ variantId: selectedVariant.id, quantity });
      setLastAddedItem({
        productName: supply.name,
        thumbnail,
        shapeName: '',
        sizeName: '',
        colorName: selectedVariant.colorName ?? null,
        price: parseFloat(selectedVariant.computedPrice),
        quantity,
      });
      setShowCartPreview(true);
    } catch {
      // cart hook already surfaces errors via its own state
    }
  }, [supply, selectedVariant, inStock, quantity, addItem]);

  return {
    supply,
    loading,
    error,
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    showCartPreview,
    setShowCartPreview,
    lastAddedItem,
    handleAddToCart,
    inStock,
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,
    hasColorVariants,
  };
}
