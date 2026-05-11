'use client';

import {
  ADMIN_ASSIGNEE_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  CURRENCY_OPTIONS,
  DISCOUNT_STATUS_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
  LANGUAGE_OPTIONS,
  PRODUCT_COLLECTION_OPTIONS,
  PRODUCT_SHAPE_OPTIONS,
  SHIPPING_STATUS_OPTIONS,
  VISIBILITY_OPTIONS,
  WHOLESALE_STATUS_OPTIONS,
} from './admin.constants';
import { Field, FormGrid, SelectField } from './components';
import { useAdminTranslation } from './i18n/admin-i18n-provider';

export function ProductEditorForm() {
  const { t } = useAdminTranslation();

  return (
    <FormGrid>
      <Field label={t('form.productName')} value="Aurora French Tips" />
      <Field label={t('form.sku')} value="NAIL-AUR-01" />
      <Field label={t('form.price')} value="28.00" type="number" />
      <SelectField label={t('form.collection')} options={PRODUCT_COLLECTION_OPTIONS} />
      <SelectField label={t('form.shape')} options={PRODUCT_SHAPE_OPTIONS} />
      <SelectField label={t('form.visibility')} options={VISIBILITY_OPTIONS} />
    </FormGrid>
  );
}

export function CollectionEditorForm() {
  const { t } = useAdminTranslation();

  return (
    <FormGrid>
      <Field label={t('form.title')} value="Best Sellers" />
      <Field label={t('form.slug')} value="best-sellers" />
      <SelectField label={t('form.sortMode')} options={COLLECTION_SORT_OPTIONS} />
      <SelectField label={t('form.visibility')} options={VISIBILITY_OPTIONS} />
    </FormGrid>
  );
}

export function WholesaleRequestForm() {
  const { t } = useAdminTranslation();

  return (
    <FormGrid>
      <Field label={t('form.businessName')} value="Luxe Nail Bar" />
      <Field label={t('form.contact')} value="Claire Martin" />
      <Field label={t('form.email')} value="claire@luxe.test" type="email" />
      <Field label={t('form.expectedVolume')} value="120 sets/month" />
      <SelectField label={t('form.status')} options={WHOLESALE_STATUS_OPTIONS} />
      <SelectField label={t('form.assignedAdmin')} options={ADMIN_ASSIGNEE_OPTIONS} />
    </FormGrid>
  );
}

export function DiscountRuleForm() {
  const { t } = useAdminTranslation();

  return (
    <FormGrid>
      <Field label={t('form.code')} value="SILVER14" />
      <SelectField label={t('form.type')} options={DISCOUNT_TYPE_OPTIONS} />
      <Field label={t('form.value')} value="10" type="number" />
      <SelectField label={t('form.status')} options={DISCOUNT_STATUS_OPTIONS} />
    </FormGrid>
  );
}

export function ShippingRuleForm() {
  const { t } = useAdminTranslation();

  return (
    <FormGrid>
      <Field label={t('form.zoneName')} value="EU standard" />
      <Field label={t('form.countries')} value="EU countries" />
      <Field label={t('form.baseFee')} value="9.99" type="number" />
      <Field label={t('form.extraItemFee')} value="2.00" type="number" />
      <SelectField label={t('form.status')} options={SHIPPING_STATUS_OPTIONS} />
      <Field label={t('form.freeShippingThreshold')} value="50.00" type="number" />
    </FormGrid>
  );
}

export function CurrencySettingsForm() {
  const { t } = useAdminTranslation();

  return (
    <FormGrid>
      <SelectField label={t('form.primaryCurrency')} options={CURRENCY_OPTIONS} />
      <Field label={t('form.usdRate')} value="1.0000" type="number" />
      <SelectField label={t('form.storefrontDisplay')} options={['USD only']} />
      <SelectField label={t('form.syncPolicy')} options={['Manual', 'Scheduled later']} />
    </FormGrid>
  );
}

export function StoreSettingsForm() {
  const { t } = useAdminTranslation();

  return (
    <FormGrid>
      <Field label={t('form.storeName')} value="Silver14 Nail" />
      <Field label={t('form.supportEmail')} value="support@silver14.test" type="email" />
      <SelectField label={t('form.defaultCurrency')} options={CURRENCY_OPTIONS} />
      <SelectField label={t('form.defaultLanguage')} options={LANGUAGE_OPTIONS} />
      <SelectField label={t('form.orderEmails')} options={['Enabled', 'Disabled']} />
      <SelectField label={t('form.wholesaleForm')} options={['Enabled', 'Disabled']} />
    </FormGrid>
  );
}
