'use client';

import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { useCart } from '@/context/CartContext';

export function DiscountInput() {
  const { t } = useT('cart');
  const { state, dispatch, applyDiscount } = useCart();

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApply = () => {
    if (applyDiscount(input)) {
      setSuccess(t('discount.applied', { code: input.toUpperCase() }));
      setError('');
    } else {
      setError(t('discount.invalid'));
      setSuccess('');
    }
  };

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_DISCOUNT' });
    setSuccess('');
    setInput('');
  };

  if (state.discountCode) {
    return (
      <div className="mb-6 flex items-center justify-between bg-white border border-[#4A7A5A]/30 px-4 py-3">
        <span className="text-[#4A7A5A] text-xs">
          {t('discount.codeApplied', { code: state.discountCode })}
        </span>
        <button
          onClick={handleRemove}
          aria-label={t('discount.remove')}
          className="text-[#9A9A9A] hover:text-[#1A1A1A]"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#9A9A9A]" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder={t('discount.placeholder')}
            className="w-full pl-9 pr-3 py-2.5 border border-[#E0E0E0] bg-white text-xs text-[#1A1A1A] placeholder:text-[#9A9A9A] outline-none focus:border-[#C0C0C0] transition-colors"
          />
        </div>
        <button
          onClick={handleApply}
          className="px-4 py-2.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all"
          style={{ letterSpacing: '0.1em' }}
        >
          {t('discount.apply')}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
      {success && <p className="text-[#4A7A5A] text-xs mt-1.5">{success}</p>}
    </div>
  );
}
