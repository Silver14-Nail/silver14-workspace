import { AnimatePresence, motion } from 'motion/react';
import { TFunction } from 'i18next';
import { Supply } from '@/MOCK_DATAS/supplies';
import { LinkBase } from '@/components/shared/LinkBase';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface Props {
  supplies: Supply[];
  t: TFunction;
}

export function SuppliesGrid({ supplies, t }: Props) {
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
        {supplies.map((supply) => (
          <motion.div
            key={supply.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LinkBase href={`/supplies/${supply.slug}`} className="group block">
              <div className="relative aspect-square bg-[#F8F8F8] mb-3 overflow-hidden">
                <ImageWithFallback
                  src={supply.images[0]}
                  alt={supply.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {!supply.inStock && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <span className="text-[#9A9A9A] text-xs uppercase tracking-widest">
                      {t('outOfStock')}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-[#1A1A1A] text-sm group-hover:opacity-70 transition-opacity">
                  {supply.name}
                </h3>
                <p
                  className="text-[#1A1A1A]"
                  style={{ fontSize: '0.95rem' }}
                >
                  ${supply.price.toFixed(2)}
                </p>
                {supply.category && (
                  <p className="text-[#9A9A9A] text-xs uppercase tracking-wider">
                    {supply.category}
                  </p>
                )}
              </div>
            </LinkBase>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
