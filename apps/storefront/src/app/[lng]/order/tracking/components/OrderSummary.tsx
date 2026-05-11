'use client';

import { useT } from 'next-i18next/client';
import { MockOrder } from '@/context/CartContext';

export default function OrderSummary({
  items,
  total,
}: {
  items: MockOrder['items'];
  total: number;
}) {
  const { t } = useT('tracking');

  return (
    <div className="bg-[#F8F8F8] p-4">
      <p className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3">{t('summary')}</p>
      <div className="space-y-1 text-sm">
        {items.slice(0, 3).map((item, i) => (
          <p key={i} className="text-[#5A5A5A]">
            {item.quantity}× {item.product.name}
            <span className="text-[#9A9A9A] text-xs">
              {' '}
              ({item.size}, {item.shape})
            </span>
          </p>
        ))}
        {items.length > 3 && (
          <p className="text-[#9A9A9A] text-xs">+{items.length - 3} more items</p>
        )}

        <div className="border-t border-[#E0E0E0] pt-2 mt-3 flex justify-between font-medium">
          <span className="text-[#6A6A6A]">{t('total')}</span>
          <span className="text-[#1A1A1A]">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
