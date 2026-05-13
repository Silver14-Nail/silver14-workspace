'use client';

import { memo } from 'react';
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react';
import { useT } from 'next-i18next/client';
import type { ProductSelections } from '../types';

interface MobileCartBarProps {
  inStock: boolean;
  canAddToCart: boolean;
  inWishlist: boolean;
  selections: ProductSelections;
  onDecrement: () => void;
  onIncrement: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

export const MobileCartBar = memo(function MobileCartBar({
  inStock,
  canAddToCart,
  inWishlist,
  selections,
  onDecrement,
  onIncrement,
  onAddToCart,
  onToggleWishlist,
}: MobileCartBarProps) {
  const { t } = useT('product-details');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] z-30 safe-area-pb">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          {/* Quantity */}
          <div
            className="flex items-center border border-[#E0E0E0] flex-shrink-0"
            role="group"
            aria-label={t('quantity.ariaLabel')}
          >
            <button
              onClick={onDecrement}
              aria-label={t('quantity.decrease')}
              className="px-2.5 py-2 text-[#1A1A1A]"
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span
              className="px-3 text-sm text-[#1A1A1A] min-w-[2rem] text-center"
              aria-live="polite"
            >
              {selections.quantity}
            </span>
            <button
              onClick={onIncrement}
              aria-label={t('quantity.increase')}
              className="px-2.5 py-2 text-[#1A1A1A]"
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>

          {/* Add to cart */}
          <button
            onClick={onAddToCart}
            disabled={!canAddToCart}
            aria-disabled={!canAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-all ${
              canAddToCart ? 'bg-[#1A1A1A] text-white' : 'bg-[#E0E0E0] text-[#9A9A9A]'
            }`}
            style={{ letterSpacing: '0.12em' }}
          >
            <ShoppingBag className="size-4" aria-hidden />
            {!inStock ? t('actions.soldOut') : t('actions.addToBag')}
          </button>

          {/* Wishlist */}
          <button
            onClick={onToggleWishlist}
            aria-label={inWishlist ? t('actions.removeFromWishlist') : t('actions.addToWishlist')}
            aria-pressed={inWishlist}
            className={`p-3 border flex-shrink-0 ${inWishlist ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#E0E0E0]'}`}
          >
            <Heart
              className={`size-4 ${inWishlist ? 'fill-white text-white' : 'text-[#1A1A1A]'}`}
              aria-hidden
            />
          </button>
        </div>

        {!canAddToCart && (
          <p className="text-[#C0C0C0] text-xs text-center" role="alert">
            {t('actions.selectHint')}
          </p>
        )}
      </div>
    </div>
  );
});
