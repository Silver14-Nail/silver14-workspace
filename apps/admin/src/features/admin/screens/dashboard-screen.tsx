 'use client';

import { dashboardMetrics } from '../admin.data';
import { AdminShell, MetricCard, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { OrdersTable, WholesaleTable } from '../tables';

export function DashboardScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.dashboard.eyebrow')}
        title={t('page.dashboard.title')}
        description={t('page.dashboard.description')}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title={t('panel.recentOrders')} description={t('panel.recentOrdersDescription')}>
          <OrdersTable compact />
        </Panel>
        <Panel title={t('panel.wholesaleInbox')} description={t('panel.wholesaleInboxDescription')}>
          <WholesaleTable compact />
        </Panel>
      </section>
    </AdminShell>
  );
}
