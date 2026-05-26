'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ApiProductVariant, CreateVariantPayload, UpdateVariantPayload } from '../products/types';
import { createSupplyVariantAction, updateSupplyVariantAction } from './actions';

interface SupplyVariantFormDrawerProps {
  supplyId: string;
  variant?: ApiProductVariant;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SupplyVariantFormDrawer({
  supplyId,
  variant,
  onClose,
  onSuccess,
}: SupplyVariantFormDrawerProps) {
  const { t } = useTranslation('supplies');
  const isEdit = variant !== undefined;

  const [colorName, setColorName] = useState(variant?.colorName ?? '');
  const [colorHex, setColorHex] = useState(variant?.colorHex ?? '');
  const [sku, setSku] = useState(variant?.sku ?? '');
  const [price, setPrice] = useState(variant ? Number(variant.computedPrice).toFixed(2) : '');
  const [stock, setStock] = useState(variant ? String(variant.stockQty) : '0');
  const [isAvailable, setIsAvailable] = useState(variant?.isAvailable ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isValidHex = !colorHex || /^#[0-9A-Fa-f]{6}$/.test(colorHex);
  const canSubmit = price !== '' && parseFloat(price) >= 0 && isValidHex;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');

    const payload: CreateVariantPayload | UpdateVariantPayload = {
      sku: sku.trim() || undefined,
      computedPrice: parseFloat(price),
      stockQty: Math.max(0, parseInt(stock, 10) || 0),
      isAvailable,
      colorName: colorName.trim() || null,
      colorHex: colorHex.trim() || null,
    };

    const result = isEdit
      ? await updateSupplyVariantAction(supplyId, variant.id, payload as UpdateVariantPayload)
      : await createSupplyVariantAction(supplyId, payload as CreateVariantPayload);

    setSaving(false);
    if (result.success) {
      onSuccess();
    } else {
      setError((result as { error: string }).error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/20" onClick={onClose} />
      <div className="fixed bottom-0 right-0 sm:top-0 w-full sm:w-[380px] h-[90vh] sm:h-full z-[70] flex flex-col shadow-2xl bg-white rounded-t-2xl sm:rounded-none overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#111827]">
            {isEdit ? t('variantForm.editTitle') : t('variantForm.addTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* Color Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              {t('variantForm.colorName')}
            </label>
            <input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder={t('variantForm.colorNamePlaceholder')}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
            />
          </div>

          {/* Color Hex */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              {t('variantForm.colorHex')}
            </label>
            <div className="flex items-center gap-2">
              <input
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                placeholder={t('variantForm.colorHexPlaceholder')}
                maxLength={7}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm text-[#111827] outline-none transition-colors font-mono ${
                  !isValidHex ? 'border-red-300 focus:border-red-400' : 'border-[#E5E7EB] focus:border-[#111827]'
                }`}
              />
              <span
                className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex-shrink-0 transition-colors"
                style={{ backgroundColor: isValidHex && colorHex ? colorHex : '#F9FAFB' }}
              />
            </div>
            {!isValidHex && (
              <p className="text-xs text-red-500 mt-1">Must be a valid hex color, e.g. #FF5733</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              {t('variantForm.sku')}
            </label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SUP-GEL-CLEAR"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors font-mono"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                {t('variantForm.price')} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">$</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                {t('variantForm.stock')}
              </label>
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                type="number"
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
              />
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F9FAFB]">
            <div>
              <p className="text-sm font-medium text-[#374151]">{t('variantForm.available')}</p>
              <p className="text-xs text-[#9CA3AF]">{t('variantForm.availableHint')}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isAvailable ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? t('variantForm.saving')
              : isEdit
                ? t('variantForm.save')
                : t('variantForm.add')}
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
