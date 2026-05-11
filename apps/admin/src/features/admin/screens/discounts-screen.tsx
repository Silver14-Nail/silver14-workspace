 'use client';

import { DiscountRuleForm } from '../forms';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { DiscountsTable } from '../tables';

export function DiscountsScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.discounts.eyebrow')}
        title={t('page.discounts.title')}
        description={t('page.discounts.description')}
        actionLabel={t('action.createDiscount')}
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title={t('panel.discountCampaigns')}>
          <DiscountsTable />
        </Panel>
        <Panel title={t('panel.discountRule')}>
          <DiscountRuleForm />
        </Panel>
      </section>
    </AdminShell>
  );
}
