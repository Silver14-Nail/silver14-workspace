import { AnimatePresence } from 'motion/react';
import { ProductCard } from '@/components/shared/ProductCard';
import { TFunction } from 'i18next';

interface Props {
  products: any[];
  onClearFilters: () => void;
  t: TFunction;
}

export function ProductsGrid({ products, onClearFilters, t }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-[#9A9A9A] text-sm mb-2">{t('noProducts')}</p>
        <button
          onClick={onClearFilters}
          className="text-[#1A1A1A] text-xs uppercase tracking-widest underline hover:no-underline"
        >
          {t('clearFilters')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      <AnimatePresence>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
    </div>
  );
}
