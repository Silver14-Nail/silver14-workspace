'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { useCart } from '@/context/CartContext';
import { DiscountInput } from './DiscountInput';
import { FREE_SHIPPING_THRESHOLD, PAYMENT_METHODS } from '../types';

export function OrderSummary() {
  const { t } = useT('cart');
  const router = useRouter();
  const { subtotal, discountAmount, total, state } = useCart();

  return (
    <div className="bg-[#F8F8F8] p-6 sticky top-24">
      <h2
        className="text-[#1A1A1A] mb-6 uppercase tracking-widest text-xs"
        style={{ letterSpacing: '0.15em' }}
      >
        {t('summary.title')}
      </h2>

      {/* Line items */}
      <div className="space-y-3 mb-6">
        <SummaryRow label={t('summary.subtotal')} value={`$${subtotal.toFixed(2)}`} />

        {discountAmount > 0 && (
          <SummaryRow
            label={t('summary.discount', { code: state.discountCode })}
            value={`-$${discountAmount.toFixed(2)}`}
            valueClass="text-[#4A7A5A]"
          />
        )}

        <SummaryRow
          label={t('summary.shipping')}
          value={
            subtotal >= FREE_SHIPPING_THRESHOLD ? t('shipping.free') : t('shipping.calculated')
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
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: '1.2rem',
            }}
          >
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <DiscountInput />

      <button
        onClick={() => router.push('/checkout')}
        className="w-full bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
        style={{ letterSpacing: '0.15em' }}
      >
        {t('checkout.cta')} <ArrowRight className="size-4" />
      </button>

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
