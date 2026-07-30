'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSupplies } from '@/lib/products.api';

const PAGE_SIZE = 24;
// Repeat visits to the list (including returning from a supply detail page)
// are served from cache instead of hitting the API again — same pattern as
// the products list (see useProductFilters.ts).
const STALE_TIME_MS = 5 * 60 * 1000;

export function useInfiniteSupplies(locale?: string) {
  const queryKey = ['supplies', locale ?? ''] as const;

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchSupplies({ page: pageParam, limit: PAGE_SIZE, locale }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.totalPages
        ? lastPage.pagination.currentPage + 1
        : undefined,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS,
  });

  const items = useMemo(() => (data?.pages ?? []).flatMap((page) => page.items), [data]);
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;
  const loading = isPending;
  const loadingMore = isFetchingNextPage;
  const hasMore = !!hasNextPage;

  // Stop auto-loading once a "load more" attempt fails — otherwise the
  // intersection observer re-enables as soon as isFetchingNextPage clears and
  // immediately retries the same page forever (sentinel never leaves the
  // viewport). Reset whenever the query view changes.
  const loadMoreFailedRef = useRef(false);
  useEffect(() => {
    loadMoreFailedRef.current = false;
  }, [queryKey.join('|')]);

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage || loadMoreFailedRef.current) return;
    fetchNextPage().then((result) => {
      if (result.isError) loadMoreFailedRef.current = true;
    });
  };

  return { items, loading, loadingMore, hasMore, totalItems, loadMore };
}
