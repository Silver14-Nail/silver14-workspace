'use client';

import { useT } from 'next-i18next/client';
import { FREE_SHIPPING_THRESHOLD } from '../types';

interface FreeShippingBannerProps {
  subtotal: number;
}

export function FreeShippingBanner({ subtotal }: FreeShippingBannerProps) {
  const { t } = useT('cart');

  const needs = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (needs > 0) {
    return (
      <div className="bg-[#F8F8F8] border border-[#E8E8E8] px-5 py-4 mb-8">
        <p
          className="text-[#5A5A5A] text-xs text-center"
          dangerouslySetInnerHTML={{
            __html: t('shipping.progress', { amount: needs.toFixed(2) }),
          }}
        />
        <div className="mt-3 h-0.5 bg-[#E0E0E0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A1A1A] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] border border-[#E8E8E8] px-5 py-3 mb-8 text-center">
      <p className="text-[#4A7A5A] text-xs">{t('shipping.qualified')}</p>
    </div>
  );
}
