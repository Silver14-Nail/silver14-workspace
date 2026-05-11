 'use client';

import { StoreSettingsForm } from '../forms';
import { TwoFactorSetupPanel } from '../auth/two-factor-setup-panel';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { SettingsTable } from '../tables';

export function SettingsScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.settings.eyebrow')}
        title={t('page.settings.title')}
        description={t('page.settings.description')}
        actionLabel={t('action.saveSettings')}
      />
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title={t('panel.currentSettings')}>
          <SettingsTable />
        </Panel>
        <Panel title={t('panel.generalConfiguration')}>
          <StoreSettingsForm />
        </Panel>
        <Panel
          title="Security"
          description="Configure two-factor authentication for admin sign in."
        >
          <TwoFactorSetupPanel />
        </Panel>
      </section>
    </AdminShell>
  );
}
