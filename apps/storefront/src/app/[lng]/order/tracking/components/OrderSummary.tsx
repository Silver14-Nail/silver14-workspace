'use client';

import { useT } from 'next-i18next/client';
import { useCurrency } from '@/hooks/useCurrency';
import type { TrackedOrder } from '../types';

type Props = Pick<
  TrackedOrder,
  'items' | 'subtotal' | 'shippingFee' | 'discountAmount' | 'couponCode' | 'total'
>;

export default function OrderSummary({
  items,
  subtotal,
  shippingFee,
  discountAmount,
  couponCode,
  total,
}: Props) {
  const { t } = useT('tracking');
  const { format } = useCurrency();

  return (
    <div className="bg-[#F8F8F8] p-4">
      <p className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-4">{t('summary')}</p>

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-[#9A9A9A] text-xs mb-4">{t('noItems')}</p>
      ) : (
        <div className="space-y-3 mb-4">
          {items.map((item, i) => {
            const details = [item.colorName, item.variantName, item.sizeName, item.shapeName]
              .filter(Boolean)
              .join(', ');
            return (
              <div key={i} className="flex gap-3 text-sm">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded shrink-0 bg-[#F0F0F0]"
                  />
                )}
                <div className="flex-1 min-w-0 flex justify-between gap-2">
                  <div>
                    <p className="text-[#1A1A1A]">
                      {item.quantity}× {item.productName}
                    </p>
                    {details && (
                      <p className="text-[#9A9A9A] text-xs mt-0.5">{details}</p>
                    )}
                  </div>
                  <span className="text-[#5A5A5A] shrink-0">{format(item.lineTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Breakdown */}
      <div className="border-t border-[#E0E0E0] pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-[#6A6A6A]">
          <span>{t('subtotal')}</span>
          <span>{format(subtotal)}</span>
        </div>

        <div className="flex justify-between text-[#6A6A6A]">
          <span>{t('shipping')}</span>
          <span>{shippingFee > 0 ? format(shippingFee) : '—'}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>
              {t('discount')}
              {couponCode && (
                <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  {couponCode}
                </span>
              )}
            </span>
            <span>−{format(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between font-medium text-[#1A1A1A] border-t border-[#E0E0E0] pt-2 mt-1">
          <span>{t('total')}</span>
          <span>{format(total)}</span>
        </div>
      </div>
    </div>
  );
}
