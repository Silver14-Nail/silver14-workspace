'use client';

import { memo, useCallback } from 'react';
import { Star, Minus, Plus, ShoppingBag, Heart } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { LinkBase } from '@/components/shared/LinkBase';
import type { ProductSelections } from '../types';

interface Product {
  collection: string;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  salePrice?: number;
  inStock: boolean;
  availableShapes: string[];
  availableSizes: string[];
}

interface ProductInfoProps {
  product: Product;
  selections: ProductSelections;
  canAddToCart: boolean;
  inWishlist: boolean;
  onUpdateSelection: <K extends keyof ProductSelections>(
    key: K,
    value: ProductSelections[K],
  ) => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

export const ProductInfo = memo(function ProductInfo({
  product,
  selections,
  canAddToCart,
  inWishlist,
  onUpdateSelection,
  onAddToCart,
  onToggleWishlist,
}: ProductInfoProps) {
  const { t } = useT('product-details');
  const displayPrice = product.salePrice ?? product.price;

  const decrement = useCallback(
    () => onUpdateSelection('quantity', Math.max(1, selections.quantity - 1)),
    [onUpdateSelection, selections.quantity],
  );
  const increment = useCallback(
    () => onUpdateSelection('quantity', selections.quantity + 1),
    [onUpdateSelection, selections.quantity],
  );

  const addToCartLabel = !product.inStock
    ? t('actions.soldOut')
    : !canAddToCart
      ? t('actions.selectOptions')
      : t('actions.addToBag');

  return (
    <div className="lg:pt-4">
      {/* Collection */}
      <p
        className="text-[#9A9A9A] uppercase text-xs tracking-widest mb-2"
        style={{ letterSpacing: '0.15em' }}
      >
        {product.collection}
      </p>

      {/* Name */}
      <h1
        className="text-[#1A1A1A] mb-3"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 400,
          fontSize: 'clamp(1.6rem, 4vw, 2rem)',
          lineHeight: 1.2,
        }}
      >
        {product.name}
      </h1>

      {/* Rating */}
      <div
        className="flex items-center gap-2 mb-4"
        aria-label={t('rating.ariaLabel', { rating: product.rating, count: product.reviewCount })}
      >
        <div className="flex" aria-hidden>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`size-3.5 ${star <= Math.round(product.rating) ? 'fill-[#C0C0C0] text-[#C0C0C0]' : 'text-[#E0E0E0]'}`}
            />
          ))}
        </div>
        <span className="text-[#9A9A9A] text-xs">
          {product.rating} ({t('rating.reviews', { count: product.reviewCount })})
        </span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span
          className="text-[#1A1A1A]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: '1.6rem' }}
        >
          ${displayPrice.toFixed(2)}
        </span>
        {product.salePrice && (
          <>
            <span className="text-[#9A9A9A] line-through" style={{ fontSize: '1.1rem' }}>
              ${product.price.toFixed(2)}
            </span>
            <span className="bg-[#F0F0F0] text-[#6A6A6A] text-xs px-2 py-0.5 uppercase tracking-wider">
              {t('price.save', { amount: (product.price - product.salePrice).toFixed(2) })}
            </span>
          </>
        )}
      </div>

      <div
        className="text-[#6A6A6A] mb-6"
        style={{ fontSize: '0.9rem', fontFamily: "'Cormorant Garamond', serif" }}
      >
        <LinkBase
          href="/shipping-policy"
          className="underline underline-offset-4 hover:text-black transition-colors"
        >
          {t('shipping.label')}
        </LinkBase>{' '}
        {t('shipping.calculated_at_checkout')}
      </div>

      {/* Shape selector */}
      <SelectorField label={t('selectors.shape.label')} required>
        {product.availableShapes.length === 1 ? (
          <div className="flex gap-2">
            <button
              className="px-4 py-2.5 text-xs border border-[#1A1A1A] bg-[#1A1A1A] text-white"
              aria-pressed
            >
              {product.availableShapes[0]}
            </button>
          </div>
        ) : (
          <select
            value={selections.shape}
            onChange={(e) => onUpdateSelection('shape', e.target.value)}
            className="w-full border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#1A1A1A] transition-colors"
          >
            <option value="">{t('selectors.shape.placeholder')}</option>
            {product.availableShapes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </SelectorField>

      {/* Size selector */}
      <SelectorField label={t('selectors.size.label')} required>
        <select
          value={selections.size}
          onChange={(e) => onUpdateSelection('size', e.target.value)}
          className="w-full border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#1A1A1A] transition-colors"
        >
          <option value="">{t('selectors.size.placeholder')}</option>
          {product.availableSizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </SelectorField>

      {/* Customization */}
      <SelectorField label={t('selectors.customization.label')}>
        <p className="text-[#7A7A7A] text-sm mb-3">{t('selectors.customization.hint')}</p>
        <input
          type="text"
          value={selections.customization}
          onChange={(e) => onUpdateSelection('customization', e.target.value)}
          placeholder={t('selectors.customization.placeholder')}
          maxLength={200}
          className="w-full border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#1A1A1A] transition-colors"
        />
      </SelectorField>

      {/* Desktop: Quantity + Add to cart */}
      <div className="hidden md:block">
        <div className="flex gap-3 mb-4">
          {/* Quantity */}
          <div
            className="flex items-center border border-[#E0E0E0]"
            role="group"
            aria-label={t('quantity.ariaLabel')}
          >
            <button
              onClick={decrement}
              aria-label={t('quantity.decrease')}
              className="px-3 py-3 text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span
              className="px-4 text-sm text-[#1A1A1A] min-w-[2.5rem] text-center"
              aria-live="polite"
            >
              {selections.quantity}
            </span>
            <button
              onClick={increment}
              aria-label={t('quantity.increase')}
              className="px-3 py-3 text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>

          {/* Add to cart */}
          <button
            onClick={onAddToCart}
            disabled={!canAddToCart}
            aria-disabled={!canAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs uppercase tracking-widest transition-all ${
              canAddToCart
                ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                : 'bg-[#E0E0E0] text-[#9A9A9A] cursor-not-allowed'
            }`}
            style={{ letterSpacing: '0.15em' }}
          >
            <ShoppingBag className="size-4" aria-hidden />
            {addToCartLabel}
          </button>

          {/* Wishlist */}
          <button
            onClick={onToggleWishlist}
            aria-label={inWishlist ? t('actions.removeFromWishlist') : t('actions.addToWishlist')}
            aria-pressed={inWishlist}
            className={`p-3.5 border transition-all ${inWishlist ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#E0E0E0] hover:border-[#9A9A9A]'}`}
          >
            <Heart
              className={`size-4 ${inWishlist ? 'fill-white text-white' : 'text-[#1A1A1A]'}`}
              aria-hidden
            />
          </button>
        </div>

        {!selections.size && (
          <p className="text-[#C0C0C0] text-xs mb-6" role="alert">
            {t('actions.selectHint')}
          </p>
        )}
      </div>
    </div>
  );
});

// ─── SelectorField ─────────────────────────────────────────────────────────────

function SelectorField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p
        className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3"
        style={{ letterSpacing: '0.12em' }}
      >
        {label}{' '}
        {required && (
          <span className="text-[#C0C0C0]" aria-hidden>
            *
          </span>
        )}
      </p>
      {children}
    </div>
  );
}
