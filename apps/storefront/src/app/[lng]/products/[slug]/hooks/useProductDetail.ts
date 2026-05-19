import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProduct';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { CartItem } from '@/hooks/useCart';
import type { AccordionKey, ProductSelections } from '../types';

export function useProductDetail() {
  const { slug: id } = useParams<{ slug: string }>();
  const router = useRouter();
  const { dispatch, cartCount, subtotal } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { product, loading, error } = useProduct(id ?? '');

  // Fetch a few products for "related" (exclude current)
  const { products: allProducts } = useProducts({ limit: 8 });
  const related = allProducts.filter((p) => p.id !== id).slice(0, 4);

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
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedImage(0);
    setSelections({ shape: '', size: '', customization: '', quantity: 1 });
  }, [id]);

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

  const canAddToCart = Boolean(product?.inStock && selections.size && selections.shape);

  const handleAddToCart = useCallback(() => {
    if (!product || !canAddToCart) return;
    const item: CartItem = {
      product,
      size: selections.size,
      shape: selections.shape,
      quantity: selections.quantity,
    };
    dispatch({ type: 'ADD_ITEM', payload: item });
    setLastAddedItem(item);
    setShowCartPreview(true);
  }, [product, canAddToCart, selections, dispatch]);

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
    // Cart
    cartCount,
    subtotal,
    // Handlers
    handleAddToCart,
    handleWishlist,
    router,
  };
}
