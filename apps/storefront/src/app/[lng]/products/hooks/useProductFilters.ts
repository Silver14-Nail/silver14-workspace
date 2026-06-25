import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SortOption, getSortFromParams } from '../constants';
import { fetchProducts } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';
import { getCollections, type StorefrontCollection } from '@/features/collections/collections.api';
import type { StorefrontProduct } from '@/types/product';
import type { ApiPagination } from '@/lib/products.api';

type Props = {
  searchParams: ReturnType<typeof useSearchParams>;
  router: any;
  lng: string;
  initialProducts?: StorefrontProduct[];
  initialPagination?: ApiPagination | null;
  initialCollections?: CollectionFilter[];
};

export interface CollectionFilter {
  id: string;
  slug: string;
  label: string;
}

const ALL_COLLECTION: CollectionFilter = { id: 'all', slug: 'all', label: 'All' };
const PAGE_SIZE = 24;

function mapSortToApiParams(sortBy: SortOption): { sortBy?: string; filterBy?: string } {
  switch (sortBy) {
    case 'newest':    return { sortBy: 'newest' };
    case 'price-asc': return { sortBy: 'price_asc' };
    case 'price-desc':return { sortBy: 'price_desc' };
    case 'bestseller':return { filterBy: 'bestseller' };
    default:          return {};
  }
}

export function useProductFilters({
  searchParams,
  router,
  lng,
  initialProducts,
  initialPagination,
  initialCollections,
}: Props) {
  // ── Filter state (from URL) ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeSlug, setActiveSlug]   = useState(searchParams.get('collection') || 'all');
  const [sortBy, setSortBy]           = useState<SortOption>(() => getSortFromParams(searchParams));
  const [sortOpen, setSortOpen]       = useState(false);
  const [collections, setCollections] = useState<CollectionFilter[]>(
    initialCollections ?? [ALL_COLLECTION],
  );

  const legacyFilter   = searchParams.get('filter');
  const legacyFilterBy = legacyFilter === 'new' ? 'new' : undefined;

  // ── Infinite scroll state ─────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<StorefrontProduct[]>(initialProducts ?? []);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore]         = useState(
    initialPagination ? 1 < initialPagination.totalPages : !initialProducts,
  );
  const [loading, setLoading]         = useState(!initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalItems, setTotalItems]   = useState(initialPagination?.totalItems ?? 0);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const searchRef      = useRef(searchQuery);
  const collectionRef  = useRef(activeSlug);
  const sortByRef      = useRef(sortBy);
  const filterByRef    = useRef(legacyFilterBy);
  const fetchingRef    = useRef(false);
  const generationRef  = useRef(0);
  // Skip first fetch when server already provided page-1 data
  const hasInitialDataRef = useRef(initialProducts != null);

  // Keep refs current every render (no stale closures in async callbacks)
  searchRef.current     = searchQuery;
  collectionRef.current = activeSlug;
  sortByRef.current     = sortBy;
  filterByRef.current   = legacyFilterBy;

  // ── Sync URL → state ──────────────────────────────────────────────────────
  useEffect(() => {
    setActiveSlug(searchParams.get('collection') || 'all');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(getSortFromParams(searchParams));
  }, [searchParams]);

  // ── Detect filter changes → reset accumulated list ────────────────────────
  const filterKey        = `${searchQuery}|${activeSlug}|${sortBy}|${legacyFilter ?? ''}`;
  const prevFilterKeyRef = useRef(filterKey);
  const [resetCount, setResetCount] = useState(0);

  useEffect(() => {
    if (filterKey === prevFilterKeyRef.current) return;
    prevFilterKeyRef.current  = filterKey;
    hasInitialDataRef.current = false;
    setAllProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setResetCount((c) => c + 1); // triggers the fetch effect below
  }, [filterKey]);

  // ── Core fetch function ────────────────────────────────────────────────────
  const doFetch = useCallback(
    async (pageNum: number, isReset: boolean) => {
      if (fetchingRef.current && !isReset) return;
      fetchingRef.current = true;
      const gen = ++generationRef.current;

      if (isReset) setLoading(true);
      else setLoadingMore(true);

      const apiSort = mapSortToApiParams(sortByRef.current);

      try {
        const data = await fetchProducts({
          page:       pageNum,
          limit:      PAGE_SIZE,
          search:     searchRef.current.trim() || undefined,
          collection: collectionRef.current !== 'all' ? collectionRef.current : undefined,
          sortBy:     apiSort.sortBy,
          filterBy:   filterByRef.current ?? apiSort.filterBy,
          locale:     lng,
        });

        if (gen !== generationRef.current) return; // stale — newer fetch started

        setAllProducts((prev) =>
          isReset ? data.items.map(adaptListItem) : [...prev, ...data.items.map(adaptListItem)],
        );
        setTotalItems(data.pagination.totalItems);
        setHasMore(pageNum < data.pagination.totalPages);
        setCurrentPage(pageNum);
      } catch {
        // ignore
      } finally {
        if (gen === generationRef.current) {
          fetchingRef.current = false;
          if (isReset) setLoading(false);
          else setLoadingMore(false);
        }
      }
    },
    [lng],
  );

  // ── Initial load + filter-reset fetch ─────────────────────────────────────
  useEffect(() => {
    if (hasInitialDataRef.current) {
      // Server provided page-1 data — skip client fetch on first render
      hasInitialDataRef.current = false;
      return;
    }
    doFetch(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetCount, doFetch]);

  // ── Load more ─────────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || fetchingRef.current) return;
    doFetch(currentPage + 1, false);
  }, [hasMore, loading, loadingMore, currentPage, doFetch]);

  // ── Collections (lazy load when not server-provided) ──────────────────────
  const skipCollectionFetch = useRef(!!initialCollections);
  useEffect(() => {
    if (skipCollectionFetch.current) {
      skipCollectionFetch.current = false;
      return;
    }
    getCollections({ limit: 50 })
      .then((res: { data: StorefrontCollection[] }) =>
        setCollections([
          ALL_COLLECTION,
          ...res.data.map((c) => ({ id: c.id, slug: c.slug, label: c.name })),
        ]),
      )
      .catch(() => {});
  }, []);

  // ── URL navigation helpers ────────────────────────────────────────────────
  const pushQuery = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.push(query ? `/${lng}/products?${query}` : `/${lng}/products`);
    },
    [router, lng],
  );

  const handleCollectionChange = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('filter');
      slug === 'all' ? params.delete('collection') : params.set('collection', slug);
      pushQuery(params);
    },
    [searchParams, pushQuery],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value.trim() ? params.set('search', value) : params.delete('search');
      pushQuery(params);
    },
    [searchParams, pushQuery],
  );

  const handleSortChange = useCallback(
    (option: SortOption) => {
      setSortOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('filter');
      option === 'featured' ? params.delete('sort') : params.set('sort', option);
      pushQuery(params);
    },
    [searchParams, pushQuery],
  );

  const toggleSort  = useCallback(() => setSortOpen((p) => !p), []);
  const clearFilters = useCallback(() => router.push(`/${lng}/products`), [router, lng]);

  const activeCollectionLabel =
    activeSlug !== 'all' ? (collections.find((c) => c.slug === activeSlug)?.label ?? null) : null;

  return {
    searchQuery,
    activeCollection:      activeSlug,
    activeCollectionLabel,
    sortBy,
    sortOpen,
    allProducts,
    loading,
    loadingMore,
    hasMore,
    totalItems,
    loadMore,
    collections,
    handleCollectionChange,
    handleSearchChange,
    handleSortChange,
    toggleSort,
    clearFilters,
  };
}
