'use client';

import { useState, useEffect } from 'react';
import { fetchSupplies, type SupplyQueryParams, type ApiProductListItem, type ApiPagination } from '@/lib/products.api';

export interface UseSuppliesResult {
  supplies: ApiProductListItem[];
  loading: boolean;
  error: string | null;
  pagination: ApiPagination | null;
}

export function useSupplies(params?: SupplyQueryParams): UseSuppliesResult {
  const { page, limit, search, collection, minPrice, maxPrice, sortBy, locale } = params ?? {};

  const [supplies, setSupplies] = useState<ApiProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSupplies({ page, limit, search, collection, minPrice, maxPrice, sortBy, locale })
      .then((data) => {
        if (cancelled) return;
        setSupplies(data.items);
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
  }, [page, limit, search, collection, minPrice, maxPrice, sortBy, locale]);

  return { supplies, loading, error, pagination };
}
