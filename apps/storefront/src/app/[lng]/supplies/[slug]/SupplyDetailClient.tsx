'use client';

import { useCallback } from 'react';
import { ShoppingBag, Minus, Plus, ArrowLeft, Truck, Package } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { useCurrency } from '@/hooks/useCurrency';
import { LinkBase } from '@/components/shared/LinkBase';
import { CartPreviewDialog } from '@/components/shared/CartPreviewDialog';
import { useSupplyDetail } from './hooks/useSupplyDetail';
import { SupplyNotFound, ImageGallery } from './components';
import type { ApiProductDetail } from '@/lib/products.api';

interface SupplyDetailClientProps {
  supply: ApiProductDetail | null;
}

export function SupplyDetailClient({ supply: initialSupply }: SupplyDetailClientProps) {
  const { t } = useT('supplies');
  const { format } = useCurrency();
  const sd = useSupplyDetail(initialSupply);

  const decrement = useCallback(() => sd.setQuantity(Math.max(1, sd.quantity - 1)), [sd]);
  const increment = useCallback(
    () => sd.setQuantity(Math.min(sd.quantity + 1, sd.maxQuantity || sd.quantity + 1)),
    [sd],
  );
  const canAddToCart = sd.inStock && !sd.stockExceeded;

  if (!sd.supply) return <SupplyNotFound />;

  const { supply } = sd;
  const price = supply.salePrice ? parseFloat(supply.salePrice) : parseFloat(supply.basePrice);
  const isOnSale = supply.isOnSale && supply.salePrice != null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <LinkBase
          href="/supplies"
          className="inline-flex items-center gap-2 text-[#9A9A9A] text-xs uppercase tracking-widest mb-8 hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="size-3" />
          {t('detail.backToSupplies')}
        </LinkBase>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Gallery */}
          <ImageGallery
            images={supply.images.map((img) => img.url)}
            productName={supply.name}
            selectedIndex={sd.selectedImage}
            onSelect={sd.setSelectedImage}
          />

          {/* Details */}
          <div className="space-y-6">
            {/* Name & Price */}
            <div>
              <h1 className="text-[#1A1A1A] mb-3" style={{ fontSize: '2.5rem', fontWeight: 300 }}>
                {supply.name}
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-[#1A1A1A]" style={{ fontSize: '1.75rem', fontWeight: 400 }}>
                  {format(price)}
                </p>
                {isOnSale && (
                  <p className="text-[#9A9A9A] line-through" style={{ fontSize: '1.1rem' }}>
                    {format(parseFloat(supply.basePrice))}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {supply.description && (
              <div className="border-t border-[#E8E8E8] pt-6">
                <h3
                  className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {t('detail.description')}
                </h3>
                <p className="text-[#4A4A4A] text-sm leading-relaxed">{supply.description}</p>
              </div>
            )}

            {/* Color Variant Selector */}
            {sd.hasColorVariants && supply.variants.length > 0 && (
              <div className="border-t border-[#E8E8E8] pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <p
                    className="text-[#1A1A1A] text-xs uppercase tracking-widest"
                    style={{ letterSpacing: '0.15em' }}
                  >
                    {t('detail.color')}
                  </p>
                  {sd.selectedVariant?.colorName && (
                    <span className="text-[#4A4A4A] text-xs">— {sd.selectedVariant.colorName}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {supply.variants.map((v) => {
                    const isSelected = sd.selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => sd.setSelectedVariantId(v.id)}
                        title={v.colorName ?? undefined}
                        className={`transition-all ${
                          v.colorHex
                            ? 'w-8 h-8 rounded-full border-2'
                            : 'px-3 py-1.5 rounded text-xs border'
                        } ${
                          isSelected
                            ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A] ring-offset-1'
                            : 'border-[#E0E0E0] hover:border-[#9A9A9A]'
                        } ${!v.isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={v.colorHex ? { backgroundColor: v.colorHex } : undefined}
                        disabled={!v.isAvailable}
                      >
                        {!v.colorHex && (v.colorName ?? t('detail.colorDefault'))}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart — desktop only; mobile uses the sticky bar */}
            <div className="hidden md:block border-t border-[#E8E8E8] pt-6 space-y-4">
              <div>
                <label
                  className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-2 block"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {t('detail.quantity')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrement}
                    disabled={sd.quantity <= 1}
                    className="border border-[#E0E0E0] p-2 hover:border-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="text-[#1A1A1A] w-12 text-center">{sd.quantity}</span>
                  <button
                    onClick={increment}
                    disabled={sd.inStock && sd.quantity >= sd.maxQuantity}
                    className="border border-[#E0E0E0] p-2 hover:border-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                {sd.stockExceeded && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {t('detail.insufficientStock', { max: sd.maxQuantity })}
                  </p>
                )}
              </div>

              {/* Desktop add-to-cart — no `disabled` attribute to avoid CSS hit-test caching
                  bug where click recovery breaks after hydration. Guard lives in onClick. */}
              <button
                onClick={() => { if (canAddToCart) sd.handleAddToCart(); }}
                aria-disabled={!canAddToCart}
                className={`w-full py-4 px-6 flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all ${
                  canAddToCart
                    ? 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
                    : 'bg-[#C0C0C0] text-white cursor-not-allowed'
                }`}
                style={{ letterSpacing: '0.15em' }}
              >
                <ShoppingBag className="size-4" />
                {!sd.inStock
                  ? t('detail.outOfStock')
                  : sd.stockExceeded
                    ? t('detail.insufficientStock', { max: sd.maxQuantity })
                    : t('detail.addToCart')}
              </button>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-[#E8E8E8] pt-6 space-y-4">
              {[
                {
                  Icon: Truck,
                  titleKey: 'detail.shipping.title',
                  subtitleKey: 'detail.shipping.subtitle',
                },
                {
                  Icon: Package,
                  titleKey: 'detail.packaging.title',
                  subtitleKey: 'detail.packaging.subtitle',
                },
              ].map(({ Icon, titleKey, subtitleKey }) => (
                <div key={titleKey} className="flex items-start gap-3">
                  <Icon className="size-4 text-[#C0C0C0] flex-shrink-0 mt-0.5" />
                  <div>
                    <p
                      className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-1"
                      style={{ letterSpacing: '0.12em' }}
                    >
                      {t(titleKey)}
                    </p>
                    <p className="text-[#9A9A9A] text-xs">{t(subtitleKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky add-to-cart bar — mirrors MobileCartBar pattern from product detail.
          onTouchEnd + e.preventDefault() prevents ghost click after touch interactions. */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] safe-area-pb"
        style={{ zIndex: 10000001 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Quantity */}
            <div
              className="flex items-center border border-[#E0E0E0] flex-shrink-0"
              role="group"
              aria-label={t('detail.quantity')}
            >
              <button
                onClick={decrement}
                aria-label="-"
                className="px-2.5 py-2 text-[#1A1A1A]"
              >
                <Minus className="size-3.5" aria-hidden />
              </button>
              <span className="px-3 text-sm text-[#1A1A1A] min-w-[2rem] text-center" aria-live="polite">
                {sd.quantity}
              </span>
              <button
                onClick={increment}
                aria-label="+"
                className="px-2.5 py-2 text-[#1A1A1A]"
              >
                <Plus className="size-3.5" aria-hidden />
              </button>
            </div>

            {/* Add to cart */}
            <button
              onTouchEnd={(e) => {
                if (canAddToCart) {
                  e.preventDefault();
                  sd.handleAddToCart();
                }
              }}
              onClick={() => {
                if (canAddToCart) sd.handleAddToCart();
              }}
              aria-disabled={!canAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-all ${
                canAddToCart
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#E0E0E0] text-[#9A9A9A] cursor-not-allowed'
              }`}
              style={{ letterSpacing: '0.12em' }}
            >
              <ShoppingBag className="size-4" aria-hidden />
              {!sd.inStock ? t('detail.outOfStock') : t('detail.addToCart')}
            </button>
          </div>
        </div>
      </div>

      <CartPreviewDialog
        open={sd.showCartPreview}
        onOpenChange={sd.setShowCartPreview}
        addedItem={sd.lastAddedItem}
      />
    </div>
  );
}
