'use client';

import { useState, useCallback } from 'react';
import { useT } from 'next-i18next/client';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { CartDisplayItem } from '@/features/cart/cart.types';

interface CheckoutSidebarProps {
  items: CartDisplayItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number | null;
  finalTotal: number;
  currency: string;
  couponCode?: string | null;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => Promise<void>;
}

export function CheckoutSidebar({
  items,
  subtotal,
  discountAmount,
  shippingCost,
  finalTotal,
  currency,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
}: CheckoutSidebarProps) {
  const { t } = useT('checkout');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const fmt = useCallback(
    (amount: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'EUR' }).format(
        amount,
      ),
    [currency],
  );

  const handleApply = async () => {
    if (!onApplyCoupon || !couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      await onApplyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (e: unknown) {
      setCouponError(e instanceof Error ? e.message : 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemoveCoupon) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      await onRemoveCoupon();
    } catch {
      // silently ignore remove errors
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <aside className="bg-white p-6">
      <h3
        className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-5"
        style={{ letterSpacing: '0.12em' }}
      >
        {t('sidebar.title')}
      </h3>

      <ul className="space-y-4 mb-5" aria-label={t('sidebar.itemsAriaLabel')}>
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 items-center">
            <div className="relative size-14 flex-shrink-0 bg-[#F5F5F5] overflow-hidden">
              <ImageWithFallback
                src={item.thumbnail ?? ''}
                alt={item.productName}
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
              <p className="text-[#1A1A1A] text-xs truncate">{item.productName}</p>
              <p className="text-[#9A9A9A] text-[10px]">
                {item.sizeName} / {item.shapeName}
              </p>
            </div>
            <p className="text-[#1A1A1A] text-xs flex-shrink-0">{fmt(item.lineTotal)}</p>
          </li>
        ))}
      </ul>

      {/* Coupon input */}
      {onApplyCoupon && (
        <div className="border-t border-[#F0F0F0] pt-4 mb-4">
          {couponCode ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#4A7A5A]">
                {t('sidebar.couponApplied', { code: couponCode })}
              </span>
              <button
                onClick={handleRemove}
                disabled={couponLoading}
                className="text-[#9A9A9A] hover:text-[#E53E3E] transition-colors ml-3 disabled:opacity-50"
              >
                {t('sidebar.couponRemove')}
              </button>
            </div>
          ) : (
            <>
              <label
                className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
                style={{ letterSpacing: '0.1em' }}
              >
                {t('sidebar.couponLabel')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  placeholder={t('sidebar.couponPlaceholder')}
                  className="flex-1 border border-[#E0E0E0] px-3 py-2 text-xs text-[#1A1A1A] placeholder:text-[#C0C0C0] outline-none focus:border-[#9A9A9A] transition-colors"
                />
                <button
                  onClick={handleApply}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-3 py-2 border border-[#1A1A1A] text-xs uppercase tracking-widest text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {couponLoading ? (
                    <span className="size-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    t('sidebar.couponApply')
                  )}
                </button>
              </div>
              {couponError && <p className="text-red-600 text-[10px] mt-1">{couponError}</p>}
            </>
          )}
        </div>
      )}

      <div className="border-t border-[#F0F0F0] pt-4 space-y-2">
        <SidebarRow label={t('sidebar.subtotal')} value={fmt(subtotal)} />
        {discountAmount > 0 && (
          <SidebarRow
            label={t('sidebar.discount')}
            value={`-${fmt(discountAmount)}`}
            valueClass="text-[#4A7A5A]"
          />
        )}
        <SidebarRow
          label={t('sidebar.shipping')}
          value={
            shippingCost === null
              ? t('sidebar.shippingPending')
              : shippingCost === 0
                ? t('sidebar.shippingFree')
                : fmt(shippingCost)
          }
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
              fontWeight: 500,
              fontSize: '1.1rem',
            }}
          >
            {fmt(finalTotal)}
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
