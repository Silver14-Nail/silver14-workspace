'use client';

import { useCallback } from 'react';
import { ShoppingBag, Minus, Plus, ArrowLeft, Truck, Package, RotateCcw } from 'lucide-react';
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
  const increment = useCallback(() => sd.setQuantity(sd.quantity + 1), [sd]);

  if (!sd.supply) return <SupplyNotFound />;

  const { supply } = sd;
  const price = supply.salePrice ? parseFloat(supply.salePrice) : parseFloat(supply.basePrice);
  const isOnSale = supply.isOnSale && supply.salePrice != null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
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
                        {!v.colorHex && (v.colorName ?? '?')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="border-t border-[#E8E8E8] pt-6 space-y-4">
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
                    className="border border-[#E0E0E0] p-2 hover:border-[#1A1A1A] transition-colors"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={sd.handleAddToCart}
                disabled={!sd.inStock}
                className="w-full bg-[#1A1A1A] text-white py-4 px-6 flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all hover:bg-[#2A2A2A] disabled:bg-[#C0C0C0] disabled:cursor-not-allowed"
                style={{ letterSpacing: '0.15em' }}
              >
                <ShoppingBag className="size-4" />
                {sd.inStock ? t('detail.addToCart') : t('detail.outOfStock')}
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
                {
                  Icon: RotateCcw,
                  titleKey: 'detail.returns.title',
                  subtitleKey: 'detail.returns.subtitle',
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

      <CartPreviewDialog
        open={sd.showCartPreview}
        onOpenChange={sd.setShowCartPreview}
        addedItem={sd.lastAddedItem}
      />
    </div>
  );
}
