'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { ApiNailShape, ApiNailSize, ApiProductVariant, ProductType } from '../../types';
import { createVariantAction, updateVariantAction } from '../../actions';

interface VariantFormDrawerProps {
  productId: string;
  productType: ProductType;
  variant?: ApiProductVariant;
  shapes: ApiNailShape[];
  sizes: ApiNailSize[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function VariantFormDrawer({
  productId,
  productType,
  variant,
  shapes,
  sizes,
  onClose,
  onSuccess,
}: VariantFormDrawerProps) {
  const { t } = useTranslation('products');
  const isEdit = variant !== undefined;
  const isNail = productType === 'nail';

  // NAIL fields
  const [shapeId, setShapeId] = useState(variant?.shape?.id ?? '');
  const [sizeId, setSizeId] = useState(variant?.size?.id ?? '');

  // Non-NAIL color fields
  const [colorName, setColorName] = useState(variant?.colorName ?? '');
  const [colorHex, setColorHex] = useState(variant?.colorHex ?? '');

  // Common fields
  const [sku, setSku] = useState(variant?.sku ?? '');
  const [price, setPrice] = useState(variant ? Number(variant.computedPrice).toFixed(2) : '');
  const [stock, setStock] = useState(variant ? String(variant.stockQty) : '0');
  const [isAvailable, setIsAvailable] = useState(variant?.isAvailable ?? true);

  // For non-nail types, let user choose between color or shape/size variant
  const [variantMode, setVariantMode] = useState<'color' | 'shape'>(
    isNail || (variant && variant.shape != null) ? 'shape' : 'color',
  );
  const useShapeMode = isNail || variantMode === 'shape';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeShapes = shapes.filter((s) => s.isActive);
  const selectedSize = sizes.find((s) => s.id === sizeId);
  const isCustomSizeSelected = selectedSize?.label === 'Custom';

  const handleSizeChange = (id: string) => {
    setSizeId(id);
    if (sizes.find((sz) => sz.id === id)?.label === 'Custom') setStock('9999');
  };

  const canSubmit = useShapeMode
    ? shapeId !== '' && sizeId !== '' && price !== '' && parseFloat(price) >= 0
    : price !== '' && parseFloat(price) >= 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');

    const payload = useShapeMode
      ? {
          shapeId,
          sizeId,
          sku: sku.trim() || undefined,
          computedPrice: parseFloat(price),
          stockQty: Math.max(0, parseInt(stock, 10) || 0),
          isAvailable,
        }
      : {
          sku: sku.trim() || undefined,
          computedPrice: parseFloat(price),
          stockQty: Math.max(0, parseInt(stock, 10) || 0),
          isAvailable,
          colorName: colorName.trim() || null,
          colorHex: colorHex.trim() || null,
        };

    const result = isEdit
      ? await updateVariantAction(productId, variant.id, payload)
      : await createVariantAction(productId, payload);

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
      <div className="fixed right-0 top-0 h-full w-[400px] z-[60] flex flex-col shadow-2xl bg-white">
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

          {/* Variant type toggle — only for non-nail products when not editing */}
          {!isNail && !isEdit && (
            <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden text-xs font-medium">
              <button
                type="button"
                onClick={() => setVariantMode('color')}
                className={`flex-1 py-2 transition-colors ${
                  variantMode === 'color'
                    ? 'bg-[#111827] text-white'
                    : 'bg-white text-[#6B7280] hover:bg-[#F9FAFB]'
                }`}
              >
                {t('variantForm.colorName')}
              </button>
              <button
                type="button"
                onClick={() => setVariantMode('shape')}
                className={`flex-1 py-2 transition-colors ${
                  variantMode === 'shape'
                    ? 'bg-[#111827] text-white'
                    : 'bg-white text-[#6B7280] hover:bg-[#F9FAFB]'
                }`}
              >
                {t('variantForm.shape')} / {t('variantForm.size')}
              </button>
            </div>
          )}

          {useShapeMode ? (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                  {t('variantForm.shape')}
                </label>
                <select
                  value={shapeId}
                  onChange={(e) => setShapeId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none cursor-pointer focus:border-[#111827] transition-colors"
                >
                  <option value="">{t('variantForm.shapePlaceholder')}</option>
                  {activeShapes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.sizeTier})
                    </option>
                  ))}
                </select>
                {shapes.length > activeShapes.length && (
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {t('variantForm.shapeHidden', { count: shapes.length - activeShapes.length })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                  {t('variantForm.size')}
                </label>
                <select
                  value={sizeId}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none cursor-pointer focus:border-[#111827] transition-colors"
                >
                  <option value="">{t('variantForm.sizePlaceholder')}</option>
                  {sizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} — {s.sizeCode}
                      {s.measurements ? ` (${s.measurements})` : ''}
                      {s.label === 'Custom' ? ' (made-to-order)' : ''}
                    </option>
                  ))}
                </select>
                {isCustomSizeSelected && (
                  <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-100">
                    {t('variantForm.sizeCustomHint')}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
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
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors font-mono"
                  />
                  {colorHex && /^#[0-9A-Fa-f]{6}$/.test(colorHex) && (
                    <span
                      className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex-shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              {t('variantForm.sku')}
            </label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder={isNail ? 'e.g. SHAPE-SIZE-001' : 'e.g. SUP-GEL-CLEAR'}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                {t('variantForm.price')}
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                {t('variantForm.stock')}
                {useShapeMode && isCustomSizeSelected && (
                  <span className="ml-1 font-normal text-[#9CA3AF]">{t('variantForm.stockUnlimited')}</span>
                )}
              </label>
              <input
                value={stock}
                onChange={(e) => !(useShapeMode && isCustomSizeSelected) && setStock(e.target.value)}
                readOnly={useShapeMode && isCustomSizeSelected}
                type="number"
                min="0"
                step="1"
                className={`w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none transition-colors ${
                  useShapeMode && isCustomSizeSelected
                    ? 'bg-[#F9FAFB] text-[#9CA3AF] cursor-not-allowed'
                    : 'text-[#111827] focus:border-[#111827]'
                }`}
              />
            </div>
          </div>

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
            {saving ? t('variantForm.saving') : isEdit ? t('variantForm.save') : t('variantForm.add')}
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
