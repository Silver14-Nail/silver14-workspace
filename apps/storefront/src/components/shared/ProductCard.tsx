'use client';

import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { LinkBase } from '@/components/shared/LinkBase';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { StorefrontProduct } from '@/types/product';
import { useWishlist } from '../../hooks/useWishlist';
import { useCurrency } from '../../hooks/useCurrency';
import { getPricingInfo } from '@/lib/pricing';

interface ProductCardProps {
  product: StorefrontProduct;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { format } = useCurrency();
  const inWishlist = isInWishlist(product.id);
  const pricing = getPricingInfo(product);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`group ${className}`}
    >
      <LinkBase href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-[#F5F5F5] aspect-[3/4]">
          <ImageWithFallback
            src={product.thumbnail ?? ''}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              inWishlist ? 'bg-[#1A1A1A] text-white' : 'bg-white/90 text-[#1A1A1A] hover:bg-white'
            }`}
          >
            <Heart className={`size-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {pricing.isOnSale && pricing.discountPercent != null && (
              <span
                className="bg-[#C0392B] text-white text-[9px] uppercase tracking-widest px-2.5 py-1"
                style={{ letterSpacing: '0.12em' }}
              >
                -{pricing.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span
                className="bg-[#1A1A1A] text-white text-[9px] uppercase tracking-widest px-2.5 py-1"
                style={{ letterSpacing: '0.12em' }}
              >
                New
              </span>
            )}
            {product.isBestSeller && (
              <span
                className="bg-white text-[#1A1A1A] text-[9px] uppercase tracking-widest px-2.5 py-1 border border-[#E5E5E5]"
                style={{ letterSpacing: '0.12em' }}
              >
                Best Seller
              </span>
            )}
            {!product.inStock && (
              <span
                className="bg-[#9A9A9A]/80 text-white text-[9px] uppercase tracking-widest px-2.5 py-1"
                style={{ letterSpacing: '0.12em' }}
              >
                Sold Out
              </span>
            )}
          </div>

          <div
            className="absolute inset-x-0 bottom-0 bg-white/95 py-3 text-center text-[#1A1A1A] text-xs uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{ letterSpacing: '0.15em' }}
          >
            Quick View
          </div>
        </div>

        <div className="pt-4 pb-2">
          <h3
            className="text-[#1A1A1A] text-sm mb-2 group-hover:text-[#3A3A3A] transition-colors"
            style={{ fontWeight: 500, fontSize: '1rem' }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {pricing.isOnSale ? (
              <>
                <span className="text-[#C0392B] text-sm" style={{ fontWeight: 500 }}>
                  {format(pricing.effectivePrice)}
                </span>
                <span className="text-[#9A9A9A] text-xs line-through">{format(pricing.price)}</span>
              </>
            ) : (
              <span className="text-[#1A1A1A] text-sm" style={{ fontWeight: 500 }}>
                {format(pricing.price)}
              </span>
            )}
          </div>
        </div>
      </LinkBase>
    </motion.div>
  );
}
