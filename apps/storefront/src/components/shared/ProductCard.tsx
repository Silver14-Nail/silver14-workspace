'use client';

import { motion } from 'motion/react';
import { LinkBase } from '@/components/shared/LinkBase';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Product } from '@/MOCK_DATAS/products';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const displayPrice = product.salePrice ?? product.price;

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
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
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
            {product.salePrice && (
              <span
                className="bg-[#C0C0C0] text-white text-[9px] uppercase tracking-widest px-2.5 py-1"
                style={{ letterSpacing: '0.12em' }}
              >
                Sale
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

          {/* Quick Shop overlay */}
          <div
            className="absolute inset-x-0 bottom-0 bg-white/95 py-3 text-center text-[#1A1A1A] text-xs uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{ letterSpacing: '0.15em' }}
          >
            Quick View
          </div>
        </div>

        {/* Info */}
        <div className="pt-4 pb-2">
          <p
            className="text-[#9A9A9A] text-xs uppercase tracking-widest mb-1"
            style={{ letterSpacing: '0.1em' }}
          >
            {product.collection}
          </p>
          <h3
            className="text-[#1A1A1A] text-sm mb-2 group-hover:text-[#3A3A3A] transition-colors"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: '1rem' }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-[#1A1A1A] text-sm"
              style={{ fontWeight: product.salePrice ? 400 : 500 }}
            >
              ${displayPrice.toFixed(2)}
            </span>
            {product.salePrice && (
              <span className="text-[#9A9A9A] text-sm line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-[10px] ${star <= Math.round(product.rating) ? 'text-[#C0C0C0]' : 'text-[#E5E5E5]'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-[#9A9A9A] text-[10px]">({product.reviewCount})</span>
          </div>
        </div>
      </LinkBase>
    </motion.div>
  );
}
