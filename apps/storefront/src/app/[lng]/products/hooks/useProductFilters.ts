import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SortOption, getSortFromParams } from '../constants';
import { products } from '@/MOCK_DATAS/products';

type Props = {
  searchParams: ReturnType<typeof useSearchParams>;
  router: any;
  lng: string;
};

export function useProductFilters({ searchParams, router, lng }: Props) {
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeCollection, setActiveCollection] = useState(searchParams.get('collection') || 'all');
  const [sortBy, setSortBy] = useState<SortOption>(() => getSortFromParams(searchParams));
  const [sortOpen, setSortOpen] = useState(false);

  // Sync with URL
  useEffect(() => {
    setActiveCollection(searchParams.get('collection') || 'all');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(getSortFromParams(searchParams));
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCollection !== 'all') {
      result = result.filter((p) => p.category === activeCollection);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.collection?.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? b.price));
        break;
      case 'newest':
        result = [...result.filter((p) => p.isNew), ...result.filter((p) => !p.isNew)];
        break;
      case 'bestseller':
        result = [
          ...result.filter((p) => p.isBestSeller),
          ...result.filter((p) => !p.isBestSeller),
        ];
        break;
    }

    return result;
  }, [activeCollection, searchQuery, sortBy]);

  const pushQuery = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.push(query ? `/${lng}/products?${query}` : `/${lng}/products`);
    },
    [router, lng],
  );

  const handleCollectionChange = useCallback(
    (colId: string) => {
      setActiveCollection(colId);
      const params = new URLSearchParams(searchParams.toString());
      colId === 'all' ? params.delete('collection') : params.set('collection', colId);
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
      params.delete('filter');

      option === 'featured' ? params.delete('sort') : params.set('sort', option);
      pushQuery(params);
    },
    [searchParams, pushQuery],
  );

  const toggleSort = useCallback(() => setSortOpen((prev) => !prev), []);
  const clearFilters = useCallback(() => router.push(`/${lng}/products`), [router, lng]);

  return {
    searchQuery,
    activeCollection,
    sortBy,
    sortOpen,
    filteredProducts,
    handleCollectionChange,
    handleSearchChange,
    handleSortChange,
    toggleSort,
    clearFilters,
  };
}
