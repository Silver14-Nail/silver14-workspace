'use client';

import { useT } from 'next-i18next/client';
import { LinkBase } from '@/components/shared/LinkBase';

export function ProductNotFound() {
  const { t } = useT('product-details');

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#9A9A9A] mb-4">{t('notFound.message')}</p>
        <LinkBase
          href="/products"
          className="text-[#1A1A1A] text-xs uppercase tracking-widest underline"
        >
          {t('notFound.backToShop')}
        </LinkBase>
      </div>
    </div>
  );
}
