'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { LinkBase } from '@/components/shared/LinkBase';
import { useT } from 'next-i18next/client';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/hooks/useCurrency';
import { getPendingCoupon, type PendingCoupon } from '@/features/checkout/checkout.storage';
import { FREE_SHIPPING_THRESHOLD, PAYMENT_METHODS } from '../types';
import { DiscountInput } from './DiscountInput';

export function OrderSummary() {
  const { t } = useT('cart');
  const { cartId, subtotal } = useCart();
  const { format } = useCurrency();

  const [pendingCoupon, setPendingCouponState] = useState<PendingCoupon | null>(null);

  // Hydrate pending coupon from sessionStorage (SSR-safe)
  useEffect(() => {
    setPendingCouponState(getPendingCoupon());
  }, []);

  const discountPreview = pendingCoupon?.discountPreview ?? 0;
  const estimatedTotal = Math.max(0, subtotal - discountPreview);

  return (
    <div className="bg-[#F8F8F8] p-6 sticky top-24">
      <h2
        className="text-[#1A1A1A] mb-6 uppercase tracking-widest text-xs"
        style={{ letterSpacing: '0.15em' }}
      >
        {t('summary.title')}
      </h2>

      <DiscountInput
        cartId={cartId}
        onApplied={(coupon) => setPendingCouponState(coupon)}
        onRemoved={() => setPendingCouponState(null)}
      />

      <div className="space-y-3 mb-6">
        <SummaryRow label={t('summary.subtotal')} value={format(subtotal)} />

        {discountPreview > 0 && pendingCoupon && (
          <SummaryRow
            label={t('summary.discount', { code: pendingCoupon.code })}
            value={`-${format(discountPreview)}`}
            valueClass="text-[#4A7A5A]"
          />
        )}

        <SummaryRow
          label={t('summary.shipping')}
          value={
            pendingCoupon?.discountType === 'free_shipping'
              ? t('shipping.free')
              : subtotal >= FREE_SHIPPING_THRESHOLD
                ? t('shipping.free')
                : t('shipping.calculated')
          }
        />

        <div className="border-t border-[#E0E0E0] pt-3 flex justify-between">
          <span
            className="text-[#1A1A1A] text-sm uppercase tracking-widest"
            style={{ letterSpacing: '0.1em' }}
          >
            {t('summary.total')}
          </span>
          <span
            className="text-[#1A1A1A]"
            style={{ fontWeight: 500, fontSize: '1.2rem' }}
          >
            {format(estimatedTotal)}
          </span>
        </div>
      </div>

      <LinkBase
        href="/checkout"
        className="w-full bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-[0.15em] hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
      >
        {t('checkout.cta')} <ArrowRight className="size-4" />
      </LinkBase>

      <p className="text-[#9A9A9A] text-xs text-center mt-4">{t('checkout.secure')}</p>

      <div className="flex items-center justify-center gap-3 mt-3">
        {PAYMENT_METHODS.map((pm) => (
          <span
            key={pm}
            className="text-[#9A9A9A] text-[10px] border border-[#E0E0E0] px-2 py-1 bg-white"
          >
            {pm}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  valueClass = 'text-[#1A1A1A]',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#6A6A6A]">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
