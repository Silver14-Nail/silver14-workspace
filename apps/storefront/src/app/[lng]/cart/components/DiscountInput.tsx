'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { useT } from 'next-i18next/client';

export function DiscountInput() {
  const { t } = useT('cart');
  const [input, setInput] = useState('');

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#9A9A9A]" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('discount.placeholder')}
            className="w-full pl-9 pr-3 py-2.5 border border-[#E0E0E0] bg-white text-xs text-[#1A1A1A] placeholder:text-[#9A9A9A] outline-none focus:border-[#C0C0C0] transition-colors"
          />
        </div>
        <button
          disabled
          className="px-4 py-2.5 border border-[#E0E0E0] text-[#9A9A9A] text-xs uppercase tracking-widest cursor-not-allowed"
          style={{ letterSpacing: '0.1em' }}
          title="Discount codes coming soon"
        >
          {t('discount.apply')}
        </button>
      </div>
    </div>
  );
}
