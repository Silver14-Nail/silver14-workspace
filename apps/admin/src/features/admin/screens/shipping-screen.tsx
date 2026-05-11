 'use client';

import { ShippingRuleForm } from '../forms';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { ShippingRulesTable } from '../tables';

export function ShippingScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.shipping.eyebrow')}
        title={t('page.shipping.title')}
        description={t('page.shipping.description')}
        actionLabel={t('action.addRule')}
      />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title={t('panel.shippingZones')}>
          <ShippingRulesTable />
        </Panel>
        <Panel title={t('panel.shippingRuleEditor')}>
          <ShippingRuleForm />
        </Panel>
      </section>
    </AdminShell>
  );
}
