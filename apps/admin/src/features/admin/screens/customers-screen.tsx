 'use client';

import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { CustomersTable } from '../tables';

export function CustomersScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.customers.eyebrow')}
        title={t('page.customers.title')}
        description={t('page.customers.description')}
      />
      <Panel title={t('panel.customerList')}>
        <CustomersTable />
      </Panel>
    </AdminShell>
  );
}
