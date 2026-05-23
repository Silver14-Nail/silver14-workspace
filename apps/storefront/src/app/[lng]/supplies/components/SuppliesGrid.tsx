'use client';

import { AnimatePresence, motion } from 'motion/react';
import { TFunction } from 'i18next';
import type { ApiProductListItem } from '@/lib/products.api';
import { LinkBase } from '@/components/shared/LinkBase';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  supplies: ApiProductListItem[];
  loading?: boolean;
  t: TFunction;
}

export function SuppliesGrid({ supplies, loading, t }: Props) {
  const { format } = useCurrency();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-[#F0F0F0] mb-3" />
            <div className="h-4 bg-[#F0F0F0] rounded mb-2 w-3/4" />
            <div className="h-4 bg-[#F0F0F0] rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (supplies.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-[#9A9A9A] text-sm mb-2">{t('noSupplies')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      <AnimatePresence>
        {supplies.map((supply) => {
          const thumbnailUrl = supply.thumbnail?.url ?? null;
          const price = parseFloat(supply.salePrice ?? supply.basePrice);
          const slug = supply.slug ?? supply.id;

          return (
            <motion.div
              key={supply.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LinkBase href={`/supplies/${slug}`} className="group block">
                <div className="relative aspect-square bg-[#F8F8F8] mb-3 overflow-hidden">
                  <ImageWithFallback
                    src={thumbnailUrl ?? ''}
                    alt={supply.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        })}
      </AnimatePresence>
    </div>
  );
}
