'use client';

import { useT } from 'next-i18next/client';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { CartItemType } from '@/app/[lng]/cart/types';

interface CheckoutSidebarProps {
  items: CartItemType[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  finalTotal: number;
}

export function CheckoutSidebar({
  items,
  subtotal,
  discountAmount,
  shippingCost,
  finalTotal,
}: CheckoutSidebarProps) {
  const { t } = useT('checkout');

  return (
    <aside className="bg-white p-6">
      <h3
        className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-5"
        style={{ letterSpacing: '0.12em' }}
      >
        {t('sidebar.title')}
      </h3>

      {/* Items */}
      <ul className="space-y-4 mb-5" aria-label={t('sidebar.itemsAriaLabel')}>
        {items.map((item) => {
          const lineTotal = (
            (item.product.salePrice ?? item.product.price) * item.quantity
          ).toFixed(2);
          const key = `${item.product.id}-${item.size}-${item.shape}-${item.length}`;
          return (
            <li key={key} className="flex gap-3 items-center">
              <div className="relative size-14 flex-shrink-0 bg-[#F5F5F5] overflow-hidden">
                <ImageWithFallback
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
                <span
                  className="absolute -top-1.5 -right-1.5 size-5 bg-[#6A6A6A] text-white text-[9px] rounded-full flex items-center justify-center"
                  aria-label={t('sidebar.quantityAriaLabel', { count: item.quantity })}
                >
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A1A1A] text-xs truncate">{item.product.name}</p>
                <p className="text-[#9A9A9A] text-[10px]">
                  {item.size} / {item.shape}
                </p>
              </div>
              <p className="text-[#1A1A1A] text-xs flex-shrink-0">${lineTotal}</p>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="border-t border-[#F0F0F0] pt-4 space-y-2">
        <SidebarRow label={t('sidebar.subtotal')} value={`$${subtotal.toFixed(2)}`} />
        {discountAmount > 0 && (
          <SidebarRow
            label={t('sidebar.discount')}
            value={`-$${discountAmount.toFixed(2)}`}
            valueClass="text-[#4A7A5A]"
          />
        )}
        <SidebarRow
          label={t('sidebar.shipping')}
          value={shippingCost === 0 ? t('sidebar.shippingFree') : `$${shippingCost.toFixed(2)}`}
        />
        <div className="flex justify-between pt-2 border-t border-[#F0F0F0]">
          <span
            className="text-[#1A1A1A] text-xs uppercase tracking-widest"
            style={{ letterSpacing: '0.1em' }}
          >
            {t('sidebar.total')}
          </span>
          <span
            className="text-[#1A1A1A]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: '1.1rem',
            }}
          >
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </aside>
  );
}

function SidebarRow({
  label,
  value,
  valueClass = 'text-[#6A6A6A]',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-xs text-[#6A6A6A]">
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
