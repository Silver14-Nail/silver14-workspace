'use client';

import { memo } from 'react';
import { useT } from 'next-i18next/client';
import { ProductCard } from '@/components/shared/ProductCard';

interface RelatedProductsProps {
  products: any[];
}

export const RelatedProducts = memo(function RelatedProducts({ products }: RelatedProductsProps) {
  const { t } = useT('product-details');

  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="border-t border-[#F0F0F0] py-16 md:py-20 px-4 sm:px-6 lg:px-8 mt-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <p
            className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
            style={{ letterSpacing: '0.2em' }}
          >
            {t('related.eyebrow')}
          </p>
          <h2
            id="related-heading"
            className="text-[#1A1A1A]"
            style={{
              fontWeight: 400,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            }}
          >
            {t('related.heading')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
});
