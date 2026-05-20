'use client';

import { useCallback } from 'react';
import { useT } from 'next-i18next/client';
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  ArrowLeft,
  Truck,
  Package,
  RotateCcw,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { LinkBase } from '@/components/shared/LinkBase';
import { CartPreviewDialog } from '@/components/shared/CartPreviewDialog';
import { useSupplyDetail } from './hooks/useSupplyDetail';
import { SupplyNotFound, ImageGallery } from './components';

export default function SupplyDetailPage() {
  const { t } = useT('supplies');
  const { format } = useCurrency();
  const sd = useSupplyDetail();

  const decrement = useCallback(() => sd.setQuantity(Math.max(1, sd.quantity - 1)), [sd]);
  const increment = useCallback(() => sd.setQuantity(sd.quantity + 1), [sd]);

  if (!sd.supply) return <SupplyNotFound />;

  const { supply } = sd;

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
            images={supply.images}
            productName={supply.name}
            selectedIndex={sd.selectedImage}
            onSelect={sd.setSelectedImage}
          />

          {/* Details */}
          <div className="space-y-6">
            {/* Name & Price */}
            <div>
              <p
                className="text-[#9A9A9A] uppercase text-xs tracking-widest mb-2"
                style={{ letterSpacing: '0.15em' }}
              >
                {supply.category}
              </p>
              <h1
                className="text-[#1A1A1A] mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '2.5rem',
                  fontWeight: 300,
                }}
              >
                {supply.name}
              </h1>
              <p
                className="text-[#1A1A1A]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.75rem',
                  fontWeight: 400,
                }}
              >
                {format(supply.price)}
              </p>
            </div>

            {/* Description */}
            <div className="border-t border-[#E8E8E8] pt-6">
              <h3
                className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3"
                style={{ letterSpacing: '0.15em' }}
              >
                {t('detail.description')}
              </h3>
              <p className="text-[#4A4A4A] text-sm leading-relaxed">{supply.description}</p>
            </div>

            {/* Usage Guide */}
            <div className="border-t border-[#E8E8E8] pt-6">
              <h3
                className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3"
                style={{ letterSpacing: '0.15em' }}
              >
                {t('detail.usageGuide')}
              </h3>
              <p className="text-[#4A4A4A] text-sm leading-relaxed">{supply.usageGuide}</p>
            </div>

            {/* Features */}
            {supply.features && supply.features.length > 0 && (
              <div className="border-t border-[#E8E8E8] pt-6">
                <h3
                  className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {t('detail.features')}
                </h3>
                <ul className="space-y-2">
                  {supply.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#4A4A4A] text-sm">
                      <Check className="size-4 mt-0.5 text-[#C0C0C0] flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
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
                disabled={!supply.inStock}
                className="w-full bg-[#1A1A1A] text-white py-4 px-6 flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all hover:bg-[#2A2A2A] disabled:bg-[#C0C0C0] disabled:cursor-not-allowed"
                style={{ letterSpacing: '0.15em' }}
              >
                <ShoppingBag className="size-4" />
                {supply.inStock ? t('detail.addToCart') : t('detail.outOfStock')}
              </button>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-[#E8E8E8] pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="size-4 text-[#C0C0C0] flex-shrink-0 mt-0.5" />
                <div>
                  <p
                    className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-1"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    {t('detail.shipping.title')}
                  </p>
                  <p className="text-[#9A9A9A] text-xs">{t('detail.shipping.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="size-4 text-[#C0C0C0] flex-shrink-0 mt-0.5" />
                <div>
                  <p
                    className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-1"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    {t('detail.packaging.title')}
                  </p>
                  <p className="text-[#9A9A9A] text-xs">{t('detail.packaging.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="size-4 text-[#C0C0C0] flex-shrink-0 mt-0.5" />
                <div>
                  <p
                    className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-1"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    {t('detail.returns.title')}
                  </p>
                  <p className="text-[#9A9A9A] text-xs">{t('detail.returns.subtitle')}</p>
                </div>
              </div>
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
