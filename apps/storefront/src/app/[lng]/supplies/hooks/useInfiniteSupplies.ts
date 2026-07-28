'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchSupplies, type ApiProductListItem } from '@/lib/products.api';

const PAGE_SIZE = 24;

export function useInfiniteSupplies(locale?: string) {
  const [items, setItems] = useState<ApiProductListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const fetchingRef = useRef(false);
  const generationRef = useRef(0);

  const fetchPage = useCallback(
    async (pageNum: number, isReset: boolean) => {
      if (fetchingRef.current && !isReset) return;
      fetchingRef.current = true;
      const gen = ++generationRef.current;

      if (isReset) setLoading(true);
      else setLoadingMore(true);

      try {
        const data = await fetchSupplies({ page: pageNum, limit: PAGE_SIZE, locale });
        if (gen !== generationRef.current) return;
        setItems((prev) => (isReset ? data.items : [...prev, ...data.items]));
        setTotalItems(data.pagination.totalItems);
        setHasMore(pageNum < data.pagination.totalPages);
        setPage(pageNum);
      } catch {
        // Stop auto-loading on failure — otherwise the intersection observer
        // re-enables as soon as loadingMore clears and immediately retries
        // the same page forever (sentinel never leaves the viewport).
        setHasMore(false);
      } finally {
        if (gen === generationRef.current) {
          fetchingRef.current = false;
          if (isReset) setLoading(false);
          else setLoadingMore(false);
        }
      }
    },
    [locale],
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    fetchPage(page + 1, false);
  }, [hasMore, loading, loadingMore, page, fetchPage]);

  return { items, loading, loadingMore, hasMore, totalItems, loadMore };
}
