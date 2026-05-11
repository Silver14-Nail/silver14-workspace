 'use client';

import { ProductEditorForm } from '../forms';
import { AdminShell, PageHeader, Panel } from '../components';
import { useAdminTranslation } from '../i18n/admin-i18n-provider';
import { ProductsTable } from '../tables';

export function ProductsScreen() {
  const { t } = useAdminTranslation();

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t('page.products.eyebrow')}
        title={t('page.products.title')}
        description={t('page.products.description')}
        actionLabel={t('action.createProduct')}
      />
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title={t('panel.productList')} description={t('panel.productListDescription')}>
          <ProductsTable />
        </Panel>
        <Panel title={t('panel.productEditor')} description={t('panel.productEditorDescription')}>
          <ProductEditorForm />
        </Panel>
      </section>
    </AdminShell>
  );
}
