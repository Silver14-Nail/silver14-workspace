'use client';

import { useRef, useState, useEffect } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TFunction } from 'i18next';
import type { ApiProductListItem } from '@/lib/products.api';
import { LinkBase } from '@/components/shared/LinkBase';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCurrency } from '@/hooks/useCurrency';

const DESKTOP_PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-[#F0F0F0] mb-3" />
      <div className="h-4 bg-[#F0F0F0] rounded mb-2 w-3/4" />
      <div className="h-4 bg-[#F0F0F0] rounded w-1/3" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-24">
      <p className="text-[#9A9A9A] text-sm mb-2">{message}</p>
    </div>
  );
}

function SupplyCard({ supply, t }: { supply: ApiProductListItem; t: TFunction }) {
  const { format } = useCurrency();
  const thumbnailUrl = supply.thumbnail?.url ?? null;
  const price = parseFloat(supply.salePrice ?? supply.basePrice);
  const slug = supply.slug ?? supply.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <LinkBase href={`/supplies/${slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-white mb-3">
          <ImageWithFallback
            src={thumbnailUrl ?? ''}
            alt={supply.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          {supply.isOnSale && (
            <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white text-xs px-2 py-0.5">
              {supply.discountPercent ? `-${supply.discountPercent}%` : t('sale')}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-[#1A1A1A] text-sm group-hover:opacity-70 transition-opacity">
            {supply.name}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-[#1A1A1A]" style={{ fontSize: '0.95rem' }}>
              {format(price)}
            </p>
            {supply.isOnSale && supply.basePrice && (
              <p className="text-[#9A9A9A] text-xs line-through">
                {format(parseFloat(supply.basePrice))}
              </p>
            )}
          </div>
        </div>
      </LinkBase>
    </motion.div>
  );
}

// ─── Page range helper ────────────────────────────────────────────────────────

function getPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | null)[] = [1];
  if (current > 3) items.push(null);
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  for (let i = lo; i <= hi; i++) items.push(i);
  if (current < total - 2) items.push(null);
  items.push(total);
  return items;
}

// ─── Desktop: paginated grid ──────────────────────────────────────────────────

function DesktopPaginatedGrid({
  supplies,
  totalItems,
  hasMore,
  loadingMore,
  onLoadMore,
  loading,
  t,
}: {
  supplies: ApiProductListItem[];
  totalItems: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  t: TFunction;
}) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the underlying query result changes identity —
  // keyed by total + first item id, which stay stable while more pages
  // stream in for the same query (unlike `supplies.length`, which grows
  // every time `onLoadMore` appends another page).
  const resetKey = `${totalItems}:${supplies[0]?.id ?? ''}`;
  const prevKey = useRef(resetKey);
  useEffect(() => {
    if (resetKey !== prevKey.current) {
      prevKey.current = resetKey;
      setPage(1);
    }
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(totalItems / DESKTOP_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSupplies = supplies.slice(
    (safePage - 1) * DESKTOP_PAGE_SIZE,
    safePage * DESKTOP_PAGE_SIZE,
  );
  // This page's slice isn't fully loaded yet — more server pages are needed
  // (e.g. the user paginated past what's currently in memory).
  const pageNeedsMoreData = pageSupplies.length < DESKTOP_PAGE_SIZE && hasMore;

  useEffect(() => {
    if (pageNeedsMoreData && !loadingMore) onLoadMore();
  }, [pageNeedsMoreData, loadingMore, onLoadMore]);

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: DESKTOP_PAGE_SIZE }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!totalItems) {
    return <EmptyState message={t('noSupplies')} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={safePage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {pageSupplies.map((supply) => (
            <SupplyCard key={supply.id} supply={supply} t={t} />
          ))}
          {pageNeedsMoreData &&
            Array.from({ length: DESKTOP_PAGE_SIZE - pageSupplies.length }).map((_, i) => (
              <SkeletonCard key={`pending-${i}`} />
            ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="flex items-center justify-center w-9 h-9 border border-[#E0E0E0] text-[#1A1A1A] hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          {getPageRange(safePage, totalPages).map((num, i) =>
            num === null ? (
              <span
                key={`ellipsis-${i}`}
                className="w-9 h-9 flex items-center justify-center text-[#9A9A9A] text-xs"
              >
                …
              </span>
            ) : (
              <button
                key={num}
                onClick={() => goToPage(num)}
                className={`w-9 h-9 text-xs border transition-colors ${
                  num === safePage
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-[#1A1A1A] border-[#E0E0E0] hover:border-[#1A1A1A] hover:bg-[#F5F5F5]'
                }`}
                aria-current={num === safePage ? 'page' : undefined}
              >
                {num}
              </button>
            ),
          )}

          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="flex items-center justify-center w-9 h-9 border border-[#E0E0E0] text-[#1A1A1A] hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </>
  );
}

// ─── Mobile: windowed 2-column grid ──────────────────────────────────────────

function MobileVirtualGrid({ supplies, t }: { supplies: ApiProductListItem[]; t: TFunction }) {
  const rowCount = Math.ceil(supplies.length / 2);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 320,
    overscan: 3,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
      {virtualItems.map((row) => {
        const i0 = row.index * 2;
        const i1 = i0 + 1;
        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${row.start}px)`,
            }}
            className="grid grid-cols-2 gap-4 pb-6"
          >
            {supplies[i0] && <SupplyCard supply={supplies[i0]} t={t} />}
            {supplies[i1] && <SupplyCard supply={supplies[i1]} t={t} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  supplies: ApiProductListItem[];
  totalItems: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  t: TFunction;
}

export function SuppliesGrid({
  supplies,
  totalItems,
  hasMore,
  loadingMore,
  onLoadMore,
  loading,
  t,
}: Props) {
  return (
    <>
      {/* Mobile: virtual scrolling — hidden on md and above */}
      <div className="md:hidden">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : supplies.length === 0 ? (
          <EmptyState message={t('noSupplies')} />
        ) : (
          <MobileVirtualGrid supplies={supplies} t={t} />
        )}
      </div>

      {/* Desktop: paginated grid — hidden below md */}
      <div className="hidden md:block">
        <DesktopPaginatedGrid
          supplies={supplies}
          totalItems={totalItems}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={onLoadMore}
          loading={loading}
          t={t}
        />
      </div>
    </>
  );
}
