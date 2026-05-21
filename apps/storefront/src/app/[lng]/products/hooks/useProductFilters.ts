import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SortOption, getSortFromParams } from '../constants';
import { useProducts } from '@/hooks/useProducts';
import { getCollections, type StorefrontCollection } from '@/features/collections/collections.api';

type Props = {
  searchParams: ReturnType<typeof useSearchParams>;
  router: any;
  lng: string;
};

export interface CollectionFilter {
  id: string;    // UUID — used as React key
  slug: string;  // used for URL param + API filter
  label: string;
}

const ALL_COLLECTION: CollectionFilter = { id: 'all', slug: 'all', label: 'All' };

function mapSortToApiParams(sortBy: SortOption): { sortBy?: string; filterBy?: string } {
  switch (sortBy) {
    case 'newest':
      return { sortBy: 'newest' };
    case 'price-asc':
      return { sortBy: 'price_asc' };
    case 'price-desc':
      return { sortBy: 'price_desc' };
    case 'bestseller':
      return { filterBy: 'bestseller' };
    default:
      return {};
  }
}

export function useProductFilters({ searchParams, router, lng }: Props) {
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeSlug, setActiveSlug] = useState(searchParams.get('collection') || 'all');
  const [sortBy, setSortBy] = useState<SortOption>(() => getSortFromParams(searchParams));
  const [sortOpen, setSortOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionFilter[]>([ALL_COLLECTION]);

  const legacyFilter = searchParams.get('filter');
  const legacyFilterBy = legacyFilter === 'new' ? 'new' : undefined;

  useEffect(() => {
    getCollections({ limit: 50 })
      .then((res: { data: StorefrontCollection[] }) =>
        setCollections([
          ALL_COLLECTION,
          ...res.data.map((c) => ({ id: c.id, slug: c.slug, label: c.name })),
        ]),
      )
      .catch(() => {
        return;
      });
  }, []);

  useEffect(() => {
    setActiveSlug(searchParams.get('collection') || 'all');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(getSortFromParams(searchParams));
  }, [searchParams]);

  const apiSort = mapSortToApiParams(sortBy);

  const { products: filteredProducts, loading, error } = useProducts({
    search: searchQuery.trim() || undefined,
    collection: activeSlug !== 'all' ? activeSlug : undefined,
    limit: 100,
    sortBy: apiSort.sortBy,
    filterBy: legacyFilterBy ?? apiSort.filterBy,
  });

  const activeCollectionLabel =
    activeSlug !== 'all'
      ? (collections.find((c) => c.slug === activeSlug)?.label ?? null)
      : null;

  const pushQuery = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.push(query ? `/${lng}/products?${query}` : `/${lng}/products`);
    },
    [router, lng],
  );

  const handleCollectionChange = useCallback(
    (slug: string) => {
      setActiveSlug(slug);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('filter');
      slug === 'all' ? params.delete('collection') : params.set('collection', slug);
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
    activeCollection: activeSlug,
    activeCollectionLabel,
    sortBy,
    sortOpen,
    filteredProducts,
    loading,
    error,
    collections,
    handleCollectionChange,
    handleSearchChange,
    handleSortChange,
    toggleSort,
    clearFilters,
  };
}
