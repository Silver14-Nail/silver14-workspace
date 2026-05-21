import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProduct';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
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

export function useProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { cartCount, subtotal, addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { product, loading, error } = useProduct(slug ?? '');

  const { products: allProducts } = useProducts({ limit: 8 });
  const related = allProducts.filter((p) => p.id !== product?.id).slice(0, 4);

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

  // Reset selections when product changes
  useEffect(() => {
    setSelectedImage(0);
    setSelections({ shape: '', size: '', customization: '', quantity: 1 });
  }, [slug]);

  // Auto-select if only one shape available
  useEffect(() => {
    if (product?.availableShapes.length === 1) {
      setSelections((prev) => ({ ...prev, shape: product.availableShapes[0] }));
    }
  }, [product]);

  // Reset size when shape changes — prevent stale shape+size combos with no variant
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

  // Sizes available for the currently selected shape.
  // Regular sizes require in-stock variants; "Custom" is always appended last.
  const availableSizesForShape = useMemo(() => {
    if (!product) return [];
    if (!selections.shape) return product.availableSizes; // includes 'Custom' always
    const validSizes = new Set(
      product.variants
        .filter((v) => v.shapeLabel === selections.shape && v.isAvailable && v.stockQty > 0)
        .map((v) => v.sizeLabel),
    );
    const regular = product.availableSizes.filter((s) => s !== 'Custom' && validSizes.has(s));
    return [...regular, 'Custom']; // Custom always last
  }, [product, selections.shape]);

  // Exact variant match for regular sizes; for Custom, fall back to any in-stock
  // variant of the selected shape so the price and variantId are always available.
  const selectedVariant = useMemo(() => {
    if (!product || !selections.shape) return null;
    if (isCustomSize) {
      return (
        product.variants.find(
          (v) => v.shapeLabel === selections.shape && v.sizeLabel === 'Custom',
        ) ??
        product.variants.find((v) => v.shapeLabel === selections.shape && v.stockQty > 0) ??
        null
      );
    }
    return (
      product.variants.find(
        (v) => v.shapeLabel === selections.shape && v.sizeLabel === selections.size,
      ) ?? null
    );
  }, [product, selections.shape, selections.size, isCustomSize]);

  // Effective display price — variant computed price with sale ratio applied
  const selectedEffectivePrice = useMemo(() => {
    if (!selectedVariant || !product) return null;
    return computeEffectivePrice(selectedVariant.computedPrice, product.price, product.salePrice);
  }, [selectedVariant, product]);

  // Custom is always purchasable when a shape is selected (made-to-order).
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
    // Data
    product,
    loading,
    error,
    related,
    inWishlist: product ? isInWishlist(product.id) : false,
    // Gallery
    selectedImage,
    setSelectedImage,
    // Selections
    selections,
    updateSelection,
    availableSizesForShape,
    selectedVariant,
    selectedEffectivePrice,
    canAddToCart,
    isCustomSize,
    // UI
    openSection,
    toggleSection,
    showCartPreview,
    setShowCartPreview,
    lastAddedItem,
    addToCartError,
    // Cart
    cartCount,
    subtotal,
    // Handlers
    handleAddToCart,
    handleWishlist,
    router,
  };
}
