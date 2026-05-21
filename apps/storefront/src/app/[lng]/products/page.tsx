'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { ProductsHeader, ProductsFilters, ProductsGrid } from './components';
import { useProductFilters } from './hooks/useProductFilters';

export default function ProductsPage() {
  const router = useRouter();
  const routeParams = useParams<{ lng?: string }>();
  const searchParams = useSearchParams();
  const { t } = useT('product');

  const lng = routeParams.lng ?? 'en';

  const {
    searchQuery,
    activeCollection,
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
  } = useProductFilters({ searchParams, router, lng });

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
          productCount={filteredProducts.length}
          t={t}
        />

        <ProductsGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          onClearFilters={clearFilters}
          t={t}
        />
      </div>
    </div>
  );
}
