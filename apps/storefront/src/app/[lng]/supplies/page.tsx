'use client';

import { useParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { SuppliesHeader, SuppliesGrid } from './components';
import { useSupplies } from './hooks/useSupplies';

export default function SuppliesPage() {
  const { t } = useT('supplies');
  const { lng } = useParams<{ lng?: string }>();
  const { supplies, loading, pagination } = useSupplies({ limit: 40, locale: lng ?? 'en' });

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <SuppliesHeader t={t} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!loading && (
          <p className="text-[#9A9A9A] text-xs mb-8">
            {t('results', { count: pagination?.totalItems ?? supplies.length })}
          </p>
        )}

        <SuppliesGrid supplies={supplies} loading={loading} t={t} />
      </div>
    </div>
  );
}
