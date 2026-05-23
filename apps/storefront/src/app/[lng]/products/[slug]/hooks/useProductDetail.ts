import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { StorefrontProductDetail, StorefrontProduct } from '@/types/product';
import type { AccordionKey, ProductSelections, CartPreviewItem } from '../types';

function computeEffectivePrice(
  computedPrice: number,
  basePrice: number,
  salePrice: number | null,
): number {
  if (salePrice !== null && salePrice < basePrice && basePrice > 0) {
    return computedPrice * (salePrice / basePrice);
  }
  return computedPrice;
}

export function useProductDetail(
  product: StorefrontProductDetail | null,
  related: StorefrontProduct[],
) {
  const router = useRouter();
  const { cartCount, subtotal, addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Gallery
  const [selectedImage, setSelectedImage] = useState(0);

  // Selections
  const [selections, setSelections] = useState<ProductSelections>({
    shape: '',
    size: '',
    customization: '',
    quantity: 1,
  });

  // UI state
  const [openSection, setOpenSection] = useState<AccordionKey | null>('description');
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartPreviewItem | null>(null);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  // Reset selections when product changes (navigating between product pages)
  useEffect(() => {
    setSelectedImage(0);
    setSelections({ shape: '', size: '', customization: '', quantity: 1 });
  }, [product?.id]);

  const updateSelection = useCallback(
    <K extends keyof ProductSelections>(key: K, value: ProductSelections[K]) => {
      setSelections((prev) => ({
        ...prev,
        [key]: value,
        ...(key === 'shape' ? { size: '' } : {}),
      }));
    },
    [],
  );

  const toggleSection = useCallback((key: AccordionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  }, []);

  const isCustomSize = selections.size === 'Custom';

  const availableSizesForShape = useMemo(() => product?.availableSizes ?? [], [product]);

  const selectedVariant = useMemo(() => {
    if (!product || !selections.shape) return null;
    if (isCustomSize) {
      return (
        product.variants.find(
          (v) => v.shapeLabel === selections.shape && v.sizeLabel === 'Custom',
        ) ??
        product.variants.find((v) => v.shapeLabel === selections.shape) ??
        null
      );
    }
    return (
      product.variants.find(
        (v) => v.shapeLabel === selections.shape && v.sizeLabel === selections.size,
      ) ?? null
    );
  }, [product, selections.shape, selections.size, isCustomSize]);

  const selectedEffectivePrice = useMemo(() => {
    if (!selectedVariant || !product) return null;
    return computeEffectivePrice(selectedVariant.computedPrice, product.price, product.salePrice);
  }, [selectedVariant, product]);

  const canAddToCart = Boolean(
    selectedVariant &&
      selectedVariant.isAvailable &&
      (selectedVariant.stockQty > 0 || isCustomSize),
  );

  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedVariant || !canAddToCart) return;

    setAddToCartError(null);

    const effectivePrice = computeEffectivePrice(
      selectedVariant.computedPrice,
      product.price,
      product.salePrice,
    );

    const preview: CartPreviewItem = {
      productName: product.name,
      thumbnail: product.thumbnail,
      shapeName: selections.shape,
      sizeName: selections.size,
      price: effectivePrice,
      quantity: selections.quantity,
      previewCartCount: cartCount + selections.quantity,
      previewSubtotal: subtotal + effectivePrice * selections.quantity,
    };
    setLastAddedItem(preview);
    setShowCartPreview(true);

    try {
      await addItem({
        variantId: selectedVariant.id,
        quantity: selections.quantity,
        ...(isCustomSize && {
          isCustomSize: true,
          customMeasurements: selections.customization
            ? { notes: selections.customization }
            : undefined,
        }),
      });
    } catch (err) {
      setShowCartPreview(false);
      setAddToCartError(err instanceof Error ? err.message : 'Failed to add item to cart');
    }
  }, [product, selectedVariant, canAddToCart, selections, addItem, isCustomSize]);

  const handleWishlist = useCallback(() => {
    if (product) toggleWishlist(product);
  }, [product, toggleWishlist]);

  return {
    product,
    related,
    inWishlist: product ? isInWishlist(product.id) : false,
    selectedImage,
    setSelectedImage,
    selections,
    updateSelection,
    availableSizesForShape,
    selectedVariant,
    selectedEffectivePrice,
    canAddToCart,
    isCustomSize,
    openSection,
    toggleSection,
    showCartPreview,
    setShowCartPreview,
    lastAddedItem,
    addToCartError,
    cartCount,
    subtotal,
    handleAddToCart,
    handleWishlist,
    router,
  };
}
