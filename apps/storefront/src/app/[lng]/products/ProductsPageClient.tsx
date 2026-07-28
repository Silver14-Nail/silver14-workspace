'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { ProductsHeader, ProductsFilters, ProductsGrid } from './components';
import { useProductFilters } from './hooks/useProductFilters';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { getScrollPosition, setScrollPosition } from './hooks/scrollPositionCache';
import type { CollectionFilter } from './hooks/useProductFilters';
import type { ApiPagination, ApiProductListItem } from '@/lib/products.api';

interface ProductsPageClientProps {
  lng: string;
  initialProducts?: ApiProductListItem[];
  initialPagination?: ApiPagination | null;
  initialCollections?: CollectionFilter[];
}

export function ProductsPageClient({
  lng,
  initialProducts,
  initialPagination,
  initialCollections,
}: ProductsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT('product');

  const {
    searchQuery,
    activeCollection,
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
  } = useProductFilters({
    searchParams,
    router,
    lng,
    initialProducts,
    initialPagination,
    initialCollections,
  });

  const sentinelRef = useIntersectionObserver(loadMore, {
    enabled: hasMore && !loading && !loadingMore,
  });

  // Take manual control of scroll restoration while this page is mounted, so
  // the browser's own (unreliable, racing) restore attempt doesn't fight with
  // restoring the position below.
  useEffect(() => {
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) return undefined;
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  // The product list itself is restored automatically by TanStack Query's
  // cache (see useProductFilters) when returning from a product's detail
  // page — this only needs to restore the scroll offset that goes with it,
  // once for each filter view, after the (already-cached) list has rendered.
  const scrollKey = `${lng}|${searchQuery}|${activeCollection}|${sortBy}`;
  const restoredForRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (loading || allProducts.length === 0) return undefined;
    if (restoredForRef.current === scrollKey) return undefined;
    restoredForRef.current = scrollKey;

    const target = getScrollPosition(scrollKey);
    if (target == null) return undefined;

    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(id);
  }, [scrollKey, loading, allProducts.length]);

  useEffect(() => {
    const onScroll = () => setScrollPosition(scrollKey, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollKey]);

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <ProductsHeader activeCollectionLabel={activeCollectionLabel} t={t} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsFilters
          COLLECTIONS={collections}
          activeCollection={activeCollection}
          onCollectionChange={handleCollectionChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          sortOpen={sortOpen}
          onSortToggle={toggleSort}
          onSortChange={handleSortChange}
          productCount={totalItems}
          t={t}
        />

        <ProductsGrid
          products={allProducts}
          totalItems={totalItems}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          loading={loading}
          error={null}
          onClearFilters={clearFilters}
          t={t}
        />

        {/* Sentinel — triggers next page when scrolled into view. Mobile only:
            desktop uses ProductsGrid's own numbered pagination instead. */}
        <div ref={sentinelRef} className="md:hidden h-16 flex items-center justify-center mt-4">
          {loadingMore && (
            <div className="size-5 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
}
