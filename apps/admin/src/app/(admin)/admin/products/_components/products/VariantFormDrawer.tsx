'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { ApiNailShape, ApiNailSize, ApiProductVariant } from '../../types';
import { createVariantAction, updateVariantAction } from '../../actions';

interface VariantFormDrawerProps {
  productId: string;
  variant?: ApiProductVariant;
  shapes: ApiNailShape[];
  sizes: ApiNailSize[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function VariantFormDrawer({
  productId,
  variant,
  shapes,
  sizes,
  onClose,
  onSuccess,
}: VariantFormDrawerProps) {
  const isEdit = variant !== undefined;

  const [shapeId, setShapeId] = useState(variant?.shape.id ?? '');
  const [sizeId, setSizeId] = useState(variant?.size.id ?? '');
  const [sku, setSku] = useState(variant?.sku ?? '');
  const [price, setPrice] = useState(variant ? Number(variant.computedPrice).toFixed(2) : '');
  const [stock, setStock] = useState(variant ? String(variant.stockQty) : '0');
  const [isAvailable, setIsAvailable] = useState(variant?.isAvailable ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeShapes = shapes.filter((s) => s.isActive);
  const canSubmit = shapeId !== '' && sizeId !== '' && price !== '' && parseFloat(price) >= 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');

    const payload = {
      shapeId,
      sizeId,
      sku: sku.trim() || undefined,
      computedPrice: parseFloat(price),
      stockQty: Math.max(0, parseInt(stock, 10) || 0),
      isAvailable,
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
            {isEdit ? 'Edit Variant' : 'Add Variant'}
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

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              Nail Shape *
            </label>
            <select
              value={shapeId}
              onChange={(e) => setShapeId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none cursor-pointer focus:border-[#111827] transition-colors"
            >
              <option value="">Select a shape...</option>
              {activeShapes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.sizeTier})
                </option>
              ))}
            </select>
            {shapes.length > activeShapes.length && (
              <p className="text-xs text-[#9CA3AF] mt-1">
                {shapes.length - activeShapes.length} inactive shapes hidden
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">Nail Size *</label>
            <select
              value={sizeId}
              onChange={(e) => setSizeId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none cursor-pointer focus:border-[#111827] transition-colors"
            >
              <option value="">Select a size...</option>
              {sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — {s.sizeCode}
                  {s.measurements ? ` (${s.measurements})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              SKU <span className="font-normal text-[#9CA3AF]">(optional)</span>
            </label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SHAPE-SIZE-001"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#111827] transition-colors font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
                Price (€) *
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
              <label className="block text-xs font-semibold mb-1.5 text-[#374151]">Stock Qty</label>
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

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F9FAFB]">
            <div>
              <p className="text-sm font-medium text-[#374151]">Available</p>
              <p className="text-xs text-[#9CA3AF]">Can be purchased by customers</p>
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Variant'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
