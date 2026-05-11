 'use client';

import { WholesaleRequestForm } from '../forms';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { WholesaleTable } from '../tables';

export function WholesaleScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.wholesale.eyebrow')}
        title={t('page.wholesale.title')}
        description={t('page.wholesale.description')}
        actionLabel={t('action.markContacted')}
      />
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title={t('panel.requestInbox')}>
          <WholesaleTable />
        </Panel>
        <Panel title={t('panel.requestDetail')} description={t('panel.requestDetailDescription')}>
          <WholesaleRequestForm />
        </Panel>
      </section>
    </AdminShell>
  );
}
