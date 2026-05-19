'use client';

import { useRef, useState, useEffect } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shared/ProductCard';
import type { TFunction } from 'i18next';
import type { Product } from '@/MOCK_DATAS/products';

// ─── Shared ───────────────────────────────────────────────────────────────────

const DESKTOP_PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#F0F0F0] aspect-[3/4] mb-4" />
      <div className="h-3 bg-[#F0F0F0] rounded w-1/2 mb-2" />
      <div className="h-4 bg-[#F0F0F0] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
    </div>
  );
}

function EmptyState({
  message,
  onClear,
  t,
}: {
  message: string;
  onClear: () => void;
  t: TFunction;
}) {
  return (
    <div className="text-center py-24">
      <p className="text-[#9A9A9A] text-sm mb-2">{message}</p>
      <button
        onClick={onClear}
        className="text-[#1A1A1A] text-xs uppercase tracking-widest underline hover:no-underline"
      >
        {t('clearFilters')}
      </button>
    </div>
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
  products,
  loading,
  onClearFilters,
  t,
}: {
  products: Product[];
  loading?: boolean;
  onClearFilters: () => void;
  t: TFunction;
}) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the product set changes (new filter/sort)
  const resetKey = `${products.length}:${products[0]?.id ?? ''}`;
  const prevKey = useRef(resetKey);
  useEffect(() => {
    if (resetKey !== prevKey.current) {
      prevKey.current = resetKey;
      setPage(1);
    }
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(products.length / DESKTOP_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageProducts = products.slice(
    (safePage - 1) * DESKTOP_PAGE_SIZE,
    safePage * DESKTOP_PAGE_SIZE,
  );

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

  if (!products.length) {
    return <EmptyState message={t('noProducts')} onClear={onClearFilters} t={t} />;
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
          {pageProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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

function MobileVirtualGrid({ products }: { products: Product[] }) {
  const rowCount = Math.ceil(products.length / 2);

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
            {products[i0] && <ProductCard product={products[i0]} />}
            {products[i1] && <ProductCard product={products[i1]} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onClearFilters: () => void;
  t: TFunction;
}

export function ProductsGrid({ products, loading, error, onClearFilters, t }: Props) {
  if (error) {
    return <EmptyState message={error} onClear={onClearFilters} t={t} />;
  }

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
        ) : products.length === 0 ? (
          <EmptyState message={t('noProducts')} onClear={onClearFilters} t={t} />
        ) : (
          <MobileVirtualGrid products={products} />
        )}
      </div>

      {/* Desktop: paginated grid — hidden below md */}
      <div className="hidden md:block">
        <DesktopPaginatedGrid
          products={products}
          loading={loading}
          onClearFilters={onClearFilters}
          t={t}
        />
      </div>
    </>
  );
}
