import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProduct';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { AccordionKey, ProductSelections, CartPreviewItem } from '../types';

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

  const updateSelection = useCallback(
    <K extends keyof ProductSelections>(key: K, value: ProductSelections[K]) => {
      setSelections((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleSection = useCallback((key: AccordionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  }, []);

  // Resolve the matching variant from the current shape+size selection
  const selectedVariant =
    product?.variants.find(
      (v) => v.shapeLabel === selections.shape && v.sizeLabel === selections.size,
    ) ?? null;

  const canAddToCart = Boolean(
    selectedVariant && selectedVariant.isAvailable && selectedVariant.stockQty > 0,
  );

  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedVariant || !canAddToCart) return;

    setAddToCartError(null);

    // Build preview snapshot immediately for instant feedback
    const preview: CartPreviewItem = {
      productName: product.name,
      thumbnail: product.thumbnail,
      shapeName: selections.shape,
      sizeName: selections.size,
      price: selectedVariant.computedPrice,
      quantity: selections.quantity,
    };
    setLastAddedItem(preview);
    setShowCartPreview(true);

    try {
      await addItem({ variantId: selectedVariant.id, quantity: selections.quantity });
    } catch (err) {
      setShowCartPreview(false);
      setAddToCartError(err instanceof Error ? err.message : 'Failed to add item to cart');
    }
  }, [product, selectedVariant, canAddToCart, selections, addItem]);

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
    canAddToCart,
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
