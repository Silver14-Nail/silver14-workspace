import { useState, useEffect } from 'react';
import type { Product } from '@/MOCK_DATAS/products';
import { fetchProduct } from '@/lib/products.api';
import { adaptDetail } from '@/lib/product.adapter';

export interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProduct(id)
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
  }, [id]);

  return { product, loading, error };
}
