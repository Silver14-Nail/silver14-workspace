import { useState, useEffect } from 'react';
import type { Product } from '@/MOCK_DATAS/products';
import { fetchProducts, type ProductQueryParams, type ApiPagination } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';

export interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: ApiPagination | null;
}

export function useProducts(params?: ProductQueryParams): UseProductsResult {
  const { page, limit, search, shapeId, minPrice, maxPrice } = params ?? {};

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProducts({ page, limit, search, shapeId, minPrice, maxPrice })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.items.map(adaptListItem));
        setPagination(data.pagination);
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
  }, [page, limit, search, shapeId, minPrice, maxPrice]);

  return { products, loading, error, pagination };
}
