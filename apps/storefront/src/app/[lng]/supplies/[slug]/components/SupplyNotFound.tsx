'use client';

import { useT } from 'next-i18next/client';
import { LinkBase } from '@/components/shared/LinkBase';

export function SupplyNotFound() {
  const { t } = useT('supplies');

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#9A9A9A] mb-4">{t('detail.notFound')}</p>
        <LinkBase
          href="/supplies"
          className="text-[#1A1A1A] text-xs uppercase tracking-widest underline"
        >
          {t('detail.backToSupplies')}
        </LinkBase>
      </div>
    </div>
  );
}
