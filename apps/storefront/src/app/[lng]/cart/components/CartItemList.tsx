'use client';

import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useT } from 'next-i18next/client';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CartItemType } from '../types';

interface CartItemListProps {
  items: CartItemType[];
  onQuantityChange: (item: CartItemType, delta: number) => void;
  onRemove: (item: CartItemType) => void;
}

export function CartItemList({ items, onQuantityChange, onRemove }: CartItemListProps) {
  const { t } = useT('cart');

  return (
    <div className="lg:col-span-2 space-y-0">
      {/* Table header */}
      <div
        className="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 pb-3 border-b border-[#E0E0E0] text-[#9A9A9A] text-xs uppercase tracking-widest"
        style={{ letterSpacing: '0.1em' }}
      >
        <span>{t('table.product')}</span>
        <span className="text-center">{t('table.quantity')}</span>
        <span className="text-right">{t('table.total')}</span>
        <span />
      </div>

      {/* Items */}
      <AnimatePresence>
        {items.map((item) => (
          <CartItemRow
            key={`${item.product.id}-${item.size}-${item.shape}-${item.length}`}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── CartItemRow ──────────────────────────────────────────────────────────────

interface CartItemRowProps {
  item: CartItemType;
  onQuantityChange: (item: CartItemType, delta: number) => void;
  onRemove: (item: CartItemType) => void;
}

function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const { t } = useT('cart');
  const price = item.product.salePrice ?? item.product.price;
  const lineTotal = (price * item.quantity).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center py-6 border-b border-[#F0F0F0]"
    >
      {/* Product info */}
      <div className="flex gap-4 items-start">
        <div className="size-20 sm:size-24 flex-shrink-0 bg-[#F5F5F5] overflow-hidden">
          <ImageWithFallback
            src={item.product.images[0]}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <Link
            href={`/products/${item.product.id}`}
            className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: '1rem' }}
          >
            {item.product.name}
          </Link>
          <p className="text-[#9A9A9A] text-xs mt-1">
            {item.size} / {item.shape} / {item.length}
          </p>
          <p className="text-[#1A1A1A] text-sm mt-2 sm:hidden">${lineTotal}</p>
        </div>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center sm:justify-center">
        <div className="flex items-center border border-[#E0E0E0]">
          <button
            onClick={() => onQuantityChange(item, -1)}
            aria-label={t('quantity.decrease')}
            className="px-2.5 py-2 hover:bg-[#F5F5F5] transition-colors"
          >
            <Minus className="size-3" />
          </button>
          <span className="px-3 text-sm text-[#1A1A1A] min-w-[2rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item, 1)}
            aria-label={t('quantity.increase')}
            className="px-2.5 py-2 hover:bg-[#F5F5F5] transition-colors"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="hidden sm:block text-right text-[#1A1A1A] text-sm">${lineTotal}</div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item)}
        aria-label={t('item.remove')}
        className="text-[#C0C0C0] hover:text-[#1A1A1A] transition-colors self-start sm:self-center"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}
