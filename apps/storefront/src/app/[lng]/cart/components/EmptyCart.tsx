'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useT } from 'next-i18next/client';

export function EmptyCart() {
  const { t } = useT('cart');

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <ShoppingBag className="size-12 text-[#D0D0D0] mx-auto mb-6" />
        <p className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3">{t('title')}</p>
        <h1
          className="text-[#1A1A1A] mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.8rem' }}
        >
          {t('empty.heading')}
        </h1>
        <p className="text-[#8A8A8A] text-sm mb-8">{t('empty.description')}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
          style={{ letterSpacing: '0.15em' }}
        >
          {t('empty.cta')} <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
