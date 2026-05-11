'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { ProductsHeader, ProductsFilters, ProductsGrid } from './components';
import { useProductFilters } from './hooks/useProductFilters';
import { COLLECTIONS } from '@/MOCK_DATAS/products';

export default function ProductsPage() {
  const router = useRouter();
  const routeParams = useParams<{ lng?: string }>();
  const searchParams = useSearchParams();
  const { t } = useT('product');

  const lng = routeParams.lng ?? 'en';

  const {
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
  } = useProductFilters({ searchParams, router, lng });

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <ProductsHeader activeCollection={activeCollection} t={t} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsFilters
          COLLECTIONS={COLLECTIONS}
          activeCollection={activeCollection}
          onCollectionChange={handleCollectionChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          sortOpen={sortOpen}
          onSortToggle={toggleSort}
          onSortChange={handleSortChange}
          t={t}
        />

        <p className="text-[#9A9A9A] text-xs mb-8">
          {t('results', { count: filteredProducts.length })}
        </p>

        <ProductsGrid products={filteredProducts} onClearFilters={clearFilters} t={t} />
      </div>
    </div>
  );
}
