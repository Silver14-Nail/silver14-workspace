 'use client';

import { CurrencySettingsForm } from '../forms';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { CurrencyTable } from '../tables';

export function CurrencyScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.currency.eyebrow')}
        title={t('page.currency.title')}
        description={t('page.currency.description')}
        actionLabel={t('action.saveCurrency')}
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title={t('panel.currencyList')}>
          <CurrencyTable />
        </Panel>
        <Panel title={t('panel.currencySettings')}>
          <CurrencySettingsForm />
        </Panel>
      </section>
    </AdminShell>
  );
}
