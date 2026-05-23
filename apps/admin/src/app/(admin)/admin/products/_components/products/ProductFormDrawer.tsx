'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types';
import { createProductAction, updateProductAction } from '../../actions';

interface ProductFormDrawerProps {
  product?: Product;
  onClose: () => void;
  onSuccess?: () => void;
}

const CURRENCIES = ['EUR', 'USD', 'GBP'];

export default function ProductFormDrawer({ product, onClose, onSuccess }: ProductFormDrawerProps) {
  const { t } = useTranslation('products');
  const isEdit = product !== undefined;

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [basePrice, setBasePrice] = useState(product ? Number(product.basePrice).toFixed(2) : '');
  const [salePrice, setSalePrice] = useState(
    product?.salePrice != null ? Number(product.salePrice).toFixed(2) : '',
  );
  const [currency, setCurrency] = useState(product?.currency ?? 'USD');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const salePriceNum = salePrice !== '' ? parseFloat(salePrice) : null;
  const basePriceNum = basePrice !== '' ? parseFloat(basePrice) : 0;
  const salePriceValid =
    salePriceNum === null || (salePriceNum >= 0 && salePriceNum < basePriceNum);
  const discountPreview =
    salePriceNum != null && basePriceNum > 0 && salePriceNum < basePriceNum
      ? Math.round((1 - salePriceNum / basePriceNum) * 100)
      : null;

  const canSubmit = name.trim() !== '' && basePrice !== '' && basePriceNum >= 0 && salePriceValid;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      basePrice: parseFloat(basePrice),
      salePrice: salePrice !== '' ? parseFloat(salePrice) : null,
      currency,
      isActive,
      isNew,
      isBestSeller,
    };

    const result = isEdit
      ? await updateProductAction(product.id, payload)
      : await createProductAction(payload);

    setSaving(false);

    if (result.success) {
      onSuccess?.();
    } else {
      setError((result as { error: string }).error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[480px] z-50 flex flex-col shadow-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">
            {isEdit ? t('form.editTitle') : t('form.addTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">{t('form.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              {t('form.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t('form.descriptionPlaceholder')}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                {t('form.basePrice')}
              </label>
              <input
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                {t('form.currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none cursor-pointer focus:border-[#111827] transition-colors"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              {t('form.salePrice')}
            </label>
            <input
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder={t('form.salePriceHint')}
              className={`w-full px-3 py-2 border rounded-lg text-sm text-[#111827] outline-none transition-colors ${
                !salePriceValid
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-[#E5E7EB] focus:border-[#111827]'
              }`}
            />
            {!salePriceValid && (
              <p className="mt-1 text-xs text-red-500">{t('form.salePriceError')}</p>
            )}
            {discountPreview != null && (
              <p className="mt-1 text-xs text-emerald-600 font-medium">{discountPreview}{t('form.off')}</p>
            )}
          </div>

          <div className="rounded-lg bg-[#F9FAFB] divide-y divide-[#E5E7EB]">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[#374151]">{t('form.active')}</p>
                <p className="text-xs text-[#9CA3AF]">{t('form.activeHint')}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isActive ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isActive ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[#374151]">{t('form.isNew')}</p>
                <p className="text-xs text-[#9CA3AF]">{t('form.isNewHint')}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNew((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isNew ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isNew ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[#374151]">{t('form.isBestSeller')}</p>
                <p className="text-xs text-[#9CA3AF]">{t('form.isBestSellerHint')}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBestSeller((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isBestSeller ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isBestSeller ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {!isEdit && (
            <p className="text-xs text-[#9CA3AF] bg-[#F9FAFB] rounded-lg px-3 py-2.5">
              {t('form.variantHint')}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('form.saving') : isEdit ? t('form.save') : t('form.create')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            {t('form.cancel')}
          </button>
        </div>
      </div>
    </>
  );
}
