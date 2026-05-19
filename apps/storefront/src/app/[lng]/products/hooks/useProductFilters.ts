import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SortOption, getSortFromParams } from '../constants';
import { useProducts } from '@/hooks/useProducts';
import { fetchShapes, type ApiShape } from '@/lib/products.api';

type Props = {
  searchParams: ReturnType<typeof useSearchParams>;
  router: any;
  lng: string;
};

export interface ShapeFilter {
  id: string;
  label: string;
}

const ALL_SHAPE: ShapeFilter = { id: 'all', label: 'All' };

export function useProductFilters({ searchParams, router, lng }: Props) {
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeShapeId, setActiveShapeId] = useState(searchParams.get('shapeId') || 'all');
  const [sortBy, setSortBy] = useState<SortOption>(() => getSortFromParams(searchParams));
  const [sortOpen, setSortOpen] = useState(false);
  const [shapes, setShapes] = useState<ShapeFilter[]>([ALL_SHAPE]);

  // Fetch shapes for filter pills (non-critical — silently ignore errors)
  useEffect(() => {
    fetchShapes()
      .then((data: ApiShape[]) =>
        setShapes([
          ALL_SHAPE,
          ...data.map((s) => ({ id: s.id, label: s.name })),
        ]),
      )
      .catch(() => {});
  }, []);

  // Sync with URL params
  useEffect(() => {
    setActiveShapeId(searchParams.get('shapeId') || 'all');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(getSortFromParams(searchParams));
  }, [searchParams]);

  const { products, loading, error } = useProducts({
    search: searchQuery.trim() || undefined,
    shapeId: activeShapeId !== 'all' ? activeShapeId : undefined,
    limit: 100,
  });

  const filteredProducts = useMemo(() => {
    if (!products.length) return products;
    switch (sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      case 'price-desc':
        return [...products].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      default:
        return products;
    }
  }, [products, sortBy]);

  const pushQuery = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.push(query ? `/${lng}/products?${query}` : `/${lng}/products`);
    },
    [router, lng],
  );

  const handleCollectionChange = useCallback(
    (shapeId: string) => {
      setActiveShapeId(shapeId);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('collection');
      shapeId === 'all' ? params.delete('shapeId') : params.set('shapeId', shapeId);
      pushQuery(params);
    },
    [searchParams, pushQuery],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      const params = new URLSearchParams(searchParams.toString());
      value.trim() ? params.set('search', value) : params.delete('search');
      pushQuery(params);
    },
    [searchParams, pushQuery],
  );

  const handleSortChange = useCallback(
    (option: SortOption) => {
      setSortBy(option);
      setSortOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      option === 'featured' ? params.delete('sort') : params.set('sort', option);
      pushQuery(params);
    },
    [searchParams, pushQuery],
  );

  const toggleSort = useCallback(() => setSortOpen((prev) => !prev), []);
  const clearFilters = useCallback(() => router.push(`/${lng}/products`), [router, lng]);

  return {
    searchQuery,
    activeCollection: activeShapeId,
    sortBy,
    sortOpen,
    filteredProducts,
    loading,
    error,
    collections: shapes,
    handleCollectionChange,
    handleSearchChange,
    handleSortChange,
    toggleSort,
    clearFilters,
  };
}
