import { useState, useEffect, useRef } from 'react';
import type { StorefrontProduct } from '@/types/product';
import { fetchProducts, type ProductQueryParams, type ApiPagination } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';

export interface UseProductsParams extends ProductQueryParams {
  initialData?: StorefrontProduct[];
}

export interface UseProductsResult {
  products: StorefrontProduct[];
  loading: boolean;
  error: string | null;
  pagination: ApiPagination | null;
}

export function useProducts(params?: UseProductsParams): UseProductsResult {
  const { page, limit, search, shapeId, collection, minPrice, maxPrice, sortBy, filterBy, locale, initialData } = params ?? {};

  const [products, setProducts] = useState<StorefrontProduct[]>(initialData ?? []);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);

  // Only skip initial fetch when server provided non-null data (even empty array is valid SSR state).
  // !!initialData would be true for [], causing client to never fetch when server returned nothing.
  const skipFirst = useRef(initialData != null);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProducts({ page, limit, search, shapeId, collection, minPrice, maxPrice, sortBy, filterBy, locale })
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
  }, [page, limit, search, shapeId, collection, minPrice, maxPrice, sortBy, filterBy, locale]);

  return { products, loading, error, pagination };
}
