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

  const availableSizesForShape = useMemo(() => {
    if (!product) return [];
    if (!selections.shape) return product.availableSizes;
    const shapeSizeLabels = new Set(
      product.variants.filter((v) => v.shapeLabel === selections.shape).map((v) => v.sizeLabel),
    );
    return product.availableSizes.filter((s) => s === 'Custom' || shapeSizeLabels.has(s));
  }, [product, selections.shape]);

  const selectedVariant = useMemo(() => {
    if (!product || !selections.shape) return null;
    if (isCustomSize) {
      // Prefer a dedicated CUSTOM variant; fall back to the first standard variant for
      // pricing display only — the backend creates a fresh item because isCustomSize=true.
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

  const canAddToCart = Boolean(selectedVariant && selectedVariant.isAvailable);

  // Intentionally NOT async: keeping this synchronous ensures setShowCartPreview(true)
  // is batched in the same React flush as the click/touchend event. An async function
  // can cause the catch block to run in the same microtask batch as the try body,
  // letting setShowCartPreview(false) override setShowCartPreview(true) before React
  // re-renders, so the dialog never appears.
  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant || !selectedVariant.isAvailable) return;

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

    // Fire and forget — the dialog is already shown above. Any API error hides it.
    addItem({
      variantId: selectedVariant.id,
      quantity: selections.quantity,
      optimisticItem: {
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: String(product.price),
          salePrice: product.salePrice != null ? String(product.salePrice) : null,
          currency: product.currency,
          images: product.images.map((url, index) => ({
            url,
            isMain: index === 0,
            sortOrder: index,
          })),
        },
        variant: {
          id: selectedVariant.id,
          stockQty: selectedVariant.stockQty,
          computedPrice: String(selectedVariant.computedPrice),
          isAvailable: selectedVariant.isAvailable,
          colorName: null,
          shape: selections.shape ? { id: selections.shape, name: selections.shape } : null,
          size: selections.size
            ? {
                id: selections.size,
                label: selections.size,
                sizeCode: selections.size,
                measurements: null,
              }
            : null,
        },
      },
      ...(isCustomSize && {
        isCustomSize: true,
        customMeasurements: selections.customization
          ? { notes: selections.customization }
          : undefined,
      }),
    }).catch((err: unknown) => {
      setShowCartPreview(false);
      setAddToCartError(err instanceof Error ? err.message : 'Failed to add item to cart');
    });
  }, [product, selectedVariant, selections, addItem, isCustomSize]);

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
