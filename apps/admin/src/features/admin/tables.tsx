 'use client';

import {
  adminAccounts,
  collections,
  currencyRules,
  customers,
  discounts,
  orders,
  products,
  shippingRules,
  storeSettings,
  wholesaleRequests,
} from './admin.data';
import { DataTable, StatusBadge } from './components';
import { useAdminTranslation } from './i18n/admin-i18n-provider';

export function OrdersTable({ compact = false }: { compact?: boolean }) {
  const { t } = useAdminTranslation();
  const columns = compact
    ? [t('table.order'), t('table.customer'), t('table.payment'), t('table.fulfillment'), t('table.total')]
    : [
        t('table.order'),
        t('table.customer'),
        t('table.email'),
        t('table.payment'),
        t('table.fulfillment'),
        t('table.channel'),
        t('table.total'),
        t('table.placed'),
      ];

  return (
    <DataTable
      columns={columns}
      rows={orders.map((order) =>
        compact
          ? [
              order.id,
              order.customer,
              <StatusBadge key={`${order.id}-payment`} tone={order.paymentTone}>
                {order.payment}
              </StatusBadge>,
              <StatusBadge key={`${order.id}-fulfillment`} tone={order.fulfillmentTone}>
                {order.fulfillment}
              </StatusBadge>,
              order.total,
            ]
          : [
              order.id,
              order.customer,
              order.email,
              <StatusBadge key={`${order.id}-payment`} tone={order.paymentTone}>
                {order.payment}
              </StatusBadge>,
              <StatusBadge key={`${order.id}-fulfillment`} tone={order.fulfillmentTone}>
                {order.fulfillment}
              </StatusBadge>,
              order.channel,
              order.total,
              order.placedAt,
            ],
      )}
    />
  );
}

export function ProductsTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[
        t('table.sku'),
        t('table.product'),
        t('table.collection'),
        t('table.price'),
        t('table.shape'),
        t('table.sizes'),
        t('table.stock'),
        t('table.visibility'),
      ]}
      rows={products.map((product) => [
        product.sku,
        product.name,
        product.collection,
        product.price,
        product.shape,
        product.sizes,
        <StatusBadge key={product.sku} tone={product.stockTone}>
          {product.stock}
        </StatusBadge>,
        product.visibility,
      ])}
    />
  );
}

export function CollectionsTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[
        t('table.collection'),
        t('table.slug'),
        t('table.products'),
        t('table.sort'),
        t('table.visibility'),
      ]}
      rows={collections.map((collection) => [
        collection.name,
        collection.slug,
        collection.products,
        collection.sort,
        <StatusBadge key={collection.slug} tone={collection.tone}>
          {collection.visibility}
        </StatusBadge>,
      ])}
    />
  );
}

export function CustomersTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[
        t('table.customer'),
        t('table.email'),
        t('table.orders'),
        t('table.spent'),
        t('table.segment'),
        t('table.country'),
      ]}
      rows={customers.map((customer) => [
        customer.name,
        customer.email,
        customer.orders,
        customer.spent,
        customer.segment,
        customer.country,
      ])}
    />
  );
}

export function WholesaleTable({ compact = false }: { compact?: boolean }) {
  const { t } = useAdminTranslation();
  const columns = compact
    ? [t('table.business'), t('table.country'), t('table.status')]
    : [
        t('table.business'),
        t('table.contact'),
        t('table.email'),
        t('table.country'),
        t('table.volume'),
        t('table.status'),
      ];

  return (
    <DataTable
      columns={columns}
      rows={wholesaleRequests.map((request) =>
        compact
          ? [
              request.business,
              request.country,
              <StatusBadge key={request.business} tone={request.tone}>
                {request.status}
              </StatusBadge>,
            ]
          : [
              request.business,
              request.contact,
              request.email,
              request.country,
              request.volume,
              <StatusBadge key={request.business} tone={request.tone}>
                {request.status}
              </StatusBadge>,
            ],
      )}
    />
  );
}

export function DiscountsTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[
        t('table.code'),
        t('table.type'),
        t('table.value'),
        t('table.condition'),
        t('table.start'),
        t('table.status'),
      ]}
      rows={discounts.map((discount) => [
        discount.code,
        discount.type,
        discount.value,
        discount.condition,
        discount.starts,
        <StatusBadge key={discount.code} tone={discount.tone}>
          {discount.status}
        </StatusBadge>,
      ])}
    />
  );
}

export function ShippingRulesTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[
        t('table.zone'),
        t('table.countries'),
        t('table.baseFee'),
        t('table.extraFee'),
        t('table.condition'),
        t('table.status'),
      ]}
      rows={shippingRules.map((rule) => [
        rule.zone,
        rule.countries,
        rule.baseFee,
        rule.extraFee,
        rule.condition,
        <StatusBadge key={rule.zone} tone={rule.tone}>
          {rule.status}
        </StatusBadge>,
      ])}
    />
  );
}

export function CurrencyTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[
        t('table.code'),
        t('table.name'),
        t('table.rate'),
        t('table.syncPolicy'),
        t('table.display'),
        t('table.status'),
      ]}
      rows={currencyRules.map((currency) => [
        currency.code,
        currency.name,
        currency.rate,
        currency.sync,
        currency.display,
        <StatusBadge key={currency.code} tone={currency.tone}>
          {currency.status}
        </StatusBadge>,
      ])}
    />
  );
}

export function AdminAccountsTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[
        t('table.user'),
        t('table.email'),
        t('table.role'),
        t('table.permissions'),
        t('table.status'),
      ]}
      rows={adminAccounts.map((account) => [
        account.user,
        account.email,
        account.role,
        account.permissions,
        <StatusBadge key={account.email} tone={account.tone}>
          {account.status}
        </StatusBadge>,
      ])}
    />
  );
}

export function RoleMatrixTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[t('table.role'), t('table.catalog'), t('table.orders'), t('table.settings')]}
      rows={[
        ['Super Admin', 'Full', 'Full', 'Full'],
        ['Admin', 'Manage', 'Manage', 'Read only'],
      ]}
    />
  );
}

export function SettingsTable() {
  const { t } = useAdminTranslation();

  return (
    <DataTable
      columns={[t('table.setting'), t('table.value')]}
      rows={storeSettings.map((setting) => [setting.label, setting.value])}
    />
  );
}
