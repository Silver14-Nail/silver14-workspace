'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { ProductsHeader, ProductsFilters, ProductsGrid } from './components';
import { useProductFilters } from './hooks/useProductFilters';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { StorefrontProduct } from '@/types/product';
import type { CollectionFilter } from './hooks/useProductFilters';
import type { ApiPagination } from '@/lib/products.api';

interface ProductsPageClientProps {
  lng: string;
  initialProducts?: StorefrontProduct[];
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
          loading={loading}
          error={null}
          onClearFilters={clearFilters}
          t={t}
        />

        {/* Sentinel — triggers next page when scrolled into view */}
        <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-4">
          {loadingMore && (
            <div className="size-5 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
}
