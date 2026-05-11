 'use client';

import { ORDER_WORKFLOW_STEPS } from '../admin.constants';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { OrdersTable } from '../tables';

export function OrdersScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.orders.eyebrow')}
        title={t('page.orders.title')}
        description={t('page.orders.description')}
        actionLabel={t('action.exportOrders')}
      />
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title={t('panel.orderQueue')}>
          <OrdersTable />
        </Panel>
        <Panel title={t('panel.orderWorkflow')} description={t('panel.orderWorkflowDescription')}>
          <div className="grid gap-3 text-sm text-neutral-700">
            {ORDER_WORKFLOW_STEPS.map((step) => (
              <div className="rounded-md border border-neutral-200 px-3 py-2" key={step}>
                {step}
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </AdminShell>
  );
}
