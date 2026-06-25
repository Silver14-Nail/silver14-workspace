'use client';

import { useParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { SuppliesHeader, SuppliesGrid } from './components';
import { useInfiniteSupplies } from './hooks/useInfiniteSupplies';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export default function SuppliesPage() {
  const { t } = useT('supplies');
  const { lng } = useParams<{ lng?: string }>();

  const { items, loading, loadingMore, hasMore, totalItems, loadMore } = useInfiniteSupplies(
    lng ?? 'en',
  );

  const sentinelRef = useIntersectionObserver(loadMore, {
    enabled: hasMore && !loading && !loadingMore,
  });

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <SuppliesHeader t={t} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!loading && (
          <p className="text-[#9A9A9A] text-xs mb-8">
            {t('results', { count: totalItems })}
          </p>
        )}

        <SuppliesGrid supplies={items} loading={loading} t={t} />

        {/* Sentinel — triggers next page load when scrolled into view */}
        <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-4">
          {loadingMore && (
            <div className="size-5 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
}
