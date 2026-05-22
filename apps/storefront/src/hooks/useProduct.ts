import { useState, useEffect } from 'react';
import type { StorefrontProductDetail } from '@/types/product';
import { fetchProductBySlug } from '@/lib/products.api';
import { adaptDetail } from '@/lib/product.adapter';

export interface UseProductResult {
  product: StorefrontProductDetail | null;
  loading: boolean;
  error: string | null;
}

export function useProduct(slug: string, locale?: string): UseProductResult {
  const [product, setProduct] = useState<StorefrontProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProductBySlug(slug, locale)
      .then((data) => {
        if (cancelled) return;
        setProduct(adaptDetail(data));
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

  return { product, loading, error };
}
