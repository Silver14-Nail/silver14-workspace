'use client';

import { useT } from 'next-i18next/client';

interface CartHeaderProps {
  cartCount: number;
}

export function CartHeader({ cartCount }: CartHeaderProps) {
  const { t } = useT('cart');

  return (
    <div className="mb-10">
      <p className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-2">{t('title')}</p>
      <h1
        className="text-[#1A1A1A]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 400,
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
        }}
      >
        {t('heading', { count: cartCount })}
      </h1>
    </div>
  );
}
