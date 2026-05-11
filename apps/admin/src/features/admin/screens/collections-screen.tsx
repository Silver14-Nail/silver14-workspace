 'use client';

import { CollectionEditorForm } from '../forms';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { CollectionsTable } from '../tables';

export function CollectionsScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.products.eyebrow')}
        title={t('page.collections.title')}
        description={t('page.collections.description')}
        actionLabel={t('action.createCollection')}
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title={t('panel.collectionList')}>
          <CollectionsTable />
        </Panel>
        <Panel title={t('panel.merchandisingSettings')} description={t('panel.merchandisingSettingsDescription')}>
          <CollectionEditorForm />
        </Panel>
      </section>
    </AdminShell>
  );
}
