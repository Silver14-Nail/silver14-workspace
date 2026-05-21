'use client';

import { useState, useEffect } from 'react';
import { Tag, X, Check, Loader2 } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { validateCoupon } from '@/features/coupons/coupons.api';
import {
  getPendingCoupon,
  setPendingCoupon,
  clearPendingCoupon,
  type PendingCoupon,
} from '@/features/checkout/checkout.storage';
import {
  getStoredCustomerTokens,
  isAccessTokenExpired,
} from '@/features/auth/customer-auth.storage';

interface DiscountInputProps {
  cartId: string | null;
  onApplied?: (coupon: PendingCoupon) => void;
  onRemoved?: () => void;
}

function getToken(): string | null {
  const tokens = getStoredCustomerTokens();
  return tokens && !isAccessTokenExpired(tokens) ? tokens.accessToken : null;
}

export function DiscountInput({ cartId, onApplied, onRemoved }: DiscountInputProps) {
  const { t } = useT('cart');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<PendingCoupon | null>(null);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const stored = getPendingCoupon();
    if (stored) setApplied(stored);
  }, []);

  async function handleApply() {
    if (!cartId || !input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await validateCoupon(input.trim(), cartId, getToken());
      if (!result.valid) {
        setError(result.message);
        return;
      }
      const coupon: PendingCoupon = {
        code: result.code!,
        discountPreview: result.discountPreview ?? 0,
        discountType: result.discountType ?? 'percent',
        savingsLabel: result.savingsLabel ?? '',
      };
      setPendingCoupon(coupon);
      setApplied(coupon);
      setInput('');
      onApplied?.(coupon);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('discount.invalid'));
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    clearPendingCoupon();
    setApplied(null);
    setError(null);
    onRemoved?.();
  }

  return (
    <div className="mb-4">
      {applied ? (
        <div className="flex items-center justify-between px-3 py-2.5 border border-[#C8E6C9] bg-[#F1F8E9]">
          <div className="flex items-center gap-2">
            <Check className="size-3.5 text-[#4A7A5A] flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#2E7D32]">
                {t('discount.codeApplied', { code: applied.code })}
              </p>
              {applied.savingsLabel && (
                <p className="text-[10px] text-[#4A7A5A] mt-0.5">{applied.savingsLabel}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-[#9A9A9A] hover:text-[#E53E3E] transition-colors ml-2"
            aria-label={t('discount.remove')}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#9A9A9A]" />
              <input
                value={input}
                onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder={t('discount.placeholder')}
                className="w-full pl-9 pr-3 py-2.5 border border-[#E0E0E0] bg-white text-xs text-[#1A1A1A] placeholder:text-[#9A9A9A] outline-none focus:border-[#C0C0C0] transition-colors"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleApply}
              disabled={loading || !input.trim() || !cartId}
              className="px-4 py-2.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              style={{ letterSpacing: '0.1em' }}
            >
              {loading ? <Loader2 className="size-3 animate-spin" /> : t('discount.apply')}
            </button>
          </div>
          {error && (
            <p className="mt-1.5 text-[10px] text-[#E53E3E]">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
