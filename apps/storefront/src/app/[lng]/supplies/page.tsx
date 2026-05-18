'use client';

import { useT } from 'next-i18next/client';
import { supplies } from '@/MOCK_DATAS/supplies';
import { SuppliesHeader, SuppliesGrid } from './components';

export default function SuppliesPage() {
  const { t } = useT('supplies');

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <SuppliesHeader t={t} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[#9A9A9A] text-xs mb-8">{t('results', { count: supplies.length })}</p>

        <SuppliesGrid supplies={supplies} t={t} />
      </div>
    </div>
  );
}
