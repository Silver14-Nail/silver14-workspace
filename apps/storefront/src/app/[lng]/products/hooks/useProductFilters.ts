import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SortOption, getSortFromParams } from '../constants';
import { fetchProducts } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';
import { getCollections, type StorefrontCollection } from '@/features/collections/collections.api';
import type { ApiPagination, ApiProductListItem } from '@/lib/products.api';

type Props = {
  searchParams: ReturnType<typeof useSearchParams>;
  router: any;
  lng: string;
  initialProducts?: ApiProductListItem[];
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
// Repeat visits to the same filter view (including returning from a product
// detail page) are served from cache instead of hitting the API again.
const STALE_TIME_MS = 5 * 60 * 1000;

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
  const [activeSlug, setActiveSlug] = useState(searchParams.get('collection') || 'all');
  const [sortBy, setSortBy] = useState<SortOption>(() => getSortFromParams(searchParams));
  const [sortOpen, setSortOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionFilter[]>(
    initialCollections ?? [ALL_COLLECTION],
  );

  const legacyFilter = searchParams.get('filter');
  const legacyFilterBy = legacyFilter === 'new' ? 'new' : undefined;

  // ── Sync URL → state ──────────────────────────────────────────────────────
  useEffect(() => {
    setActiveSlug(searchParams.get('collection') || 'all');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(getSortFromParams(searchParams));
  }, [searchParams]);

  // ── Product list — cached & paginated via TanStack Query ──────────────────
  //
  // The QueryClient lives above this page (in the root layout's
  // StoreProvider), so its cache survives this component unmounting when the
  // user visits a product's detail page — returning re-adopts the same
  // accumulated pages instantly instead of re-fetching from page 1.
  const apiSort = mapSortToApiParams(sortBy);
  const effectiveFilterBy = legacyFilterBy ?? apiSort.filterBy;
  const trimmedSearch = searchQuery.trim();

  const queryKey = useMemo(
    () =>
      [
        'products',
        lng,
        trimmedSearch,
        activeSlug,
        apiSort.sortBy ?? '',
        effectiveFilterBy ?? '',
      ] as const,
    [lng, trimmedSearch, activeSlug, apiSort.sortBy, effectiveFilterBy],
  );

  // Only meaningful the very first time this exact queryKey is seen (a fresh
  // page load) — once cached, TanStack Query ignores it on later renders.
  const initialData = useMemo(
    () =>
      initialProducts && initialPagination
        ? {
            pages: [{ items: initialProducts, pagination: initialPagination }],
            pageParams: [1],
          }
        : undefined,
    [initialProducts, initialPagination],
  );

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchProducts({
        page: pageParam,
        limit: PAGE_SIZE,
        search: trimmedSearch || undefined,
        collection: activeSlug !== 'all' ? activeSlug : undefined,
        sortBy: apiSort.sortBy,
        filterBy: effectiveFilterBy,
        locale: lng,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.totalPages
        ? lastPage.pagination.currentPage + 1
        : undefined,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS,
    initialData,
  });

  const allProducts = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.items.map(adaptListItem)),
    [data],
  );
  const totalItems = data?.pages[0]?.pagination.totalItems ?? initialPagination?.totalItems ?? 0;
  const loading = isPending;
  const loadingMore = isFetchingNextPage;
  const hasMore = !!hasNextPage;

  // Stop auto-loading once a "load more" attempt fails — otherwise the
  // intersection observer re-enables as soon as isFetchingNextPage clears and
  // immediately retries the same page forever (sentinel never leaves the
  // viewport). Reset whenever the filter view changes.
  const loadMoreFailedRef = useRef(false);
  useEffect(() => {
    loadMoreFailedRef.current = false;
  }, [queryKey]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || loadMoreFailedRef.current) return;
    fetchNextPage().then((result) => {
      if (result.isError) loadMoreFailedRef.current = true;
    });
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  const toggleSort = useCallback(() => setSortOpen((p) => !p), []);
  const clearFilters = useCallback(() => router.push(`/${lng}/products`), [router, lng]);

  const activeCollectionLabel =
    activeSlug !== 'all' ? (collections.find((c) => c.slug === activeSlug)?.label ?? null) : null;

  return {
    searchQuery,
    activeCollection: activeSlug,
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
