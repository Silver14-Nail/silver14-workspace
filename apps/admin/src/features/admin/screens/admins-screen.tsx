 'use client';

import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { AdminAccountsTable, RoleMatrixTable } from '../tables';

export function AdminsScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.admins.eyebrow')}
        title={t('page.admins.title')}
        description={t('page.admins.description')}
        actionLabel={t('action.inviteAdmin')}
      />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title={t('panel.adminUsers')}>
          <AdminAccountsTable />
        </Panel>
        <Panel title={t('panel.roleMatrix')}>
          <RoleMatrixTable />
        </Panel>
      </section>
    </AdminShell>
  );
}
