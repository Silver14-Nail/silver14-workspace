'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAdminTheme } from '@/app/context/AdminThemeContext';
import { SIZE_TIERS, TIER_LABELS } from '../../_constants';
import type { NailShape, SizeTier, AdjustmentType } from '../../_types';
import { createNailShapeAction, updateNailShapeAction } from '../../actions';

interface ShapeDrawerProps {
  shape: NailShape | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ShapeDrawer({ shape, onClose, onSuccess }: ShapeDrawerProps) {
  const { theme } = useAdminTheme();
  const dark = theme === 'dark';
  const isEdit = shape !== null;

  const [name, setName] = useState(shape?.name ?? '');
  const [lengthMm, setLengthMm] = useState(shape?.lengthMm.toString() ?? '');
  const [sizeTier, setSizeTier] = useState<SizeTier>(shape?.sizeTier ?? 'standard');
  const [priceAdjustment, setPriceAdjustment] = useState(
    shape ? Number(shape.priceAdjustment).toFixed(2) : '0.00',
  );
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>(
    shape?.adjustmentType ?? 'fixed',
  );
  const [isActive, setIsActive] = useState(shape?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim() !== '' && lengthMm !== '' && Number(lengthMm) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      lengthMm: Number(lengthMm),
      sizeTier,
      priceAdjustment: Number(priceAdjustment),
      adjustmentType,
      isActive,
    };

    const result = isEdit
      ? await updateNailShapeAction(shape.id, payload)
      : await createNailShapeAction(payload);

    setSaving(false);

    if (result.success) {
      onSuccess?.();
    } else {
      setError((result as { error: string }).error);
    }
  };

  const inputCls = `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
    dark
      ? 'bg-[#0F1117] border-[#2E3244] text-white focus:border-[#7C6EF7]'
      : 'bg-white border-[#E5E7EB] text-[#111827] focus:border-[#111827]'
  }`;

  const labelCls = `block text-xs font-semibold mb-1.5 ${dark ? 'text-gray-300' : 'text-[#374151]'}`;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div
        className={`fixed right-0 top-0 h-full w-[480px] z-50 flex flex-col shadow-2xl ${
          dark ? 'bg-[#1C1E26]' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            dark ? 'border-[#2E3244]' : 'border-[#E5E7EB]'
          }`}
        >
          <h2 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[#111827]'}`}>
            {isEdit ? 'Edit Nail Shape' : 'Add Nail Shape'}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${dark ? 'hover:bg-[#2E3244]' : 'hover:bg-[#F3F4F6]'}`}
          >
            <X className="w-4 h-4" />
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
            <label className={labelCls}>Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Almond"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Length (mm) *</label>
              <input
                value={lengthMm}
                onChange={(e) => setLengthMm(e.target.value)}
                type="number"
                min="1"
                placeholder="18"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Size Tier *</label>
              <select
                value={sizeTier}
                onChange={(e) => setSizeTier(e.target.value as SizeTier)}
                className={inputCls + ' cursor-pointer'}
              >
                {SIZE_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price Adjustment</label>
              <input
                value={priceAdjustment}
                onChange={(e) => setPriceAdjustment(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Adjustment Type</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                className={inputCls + ' cursor-pointer'}
              >
                <option value="fixed">Fixed (€)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
          </div>

          <div
            className={`flex items-center justify-between p-4 rounded-lg ${
              dark ? 'bg-[#0F1117]' : 'bg-[#F9FAFB]'
            }`}
          >
            <div>
              <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-[#374151]'}`}>
                Active
              </p>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
                Visible in product config
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isActive ? 'bg-[#111827]' : dark ? 'bg-[#2E3244]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex gap-3 ${
            dark ? 'border-[#2E3244]' : 'border-[#E5E7EB]'
          }`}
        >
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Shape'}
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              dark
                ? 'border-[#2E3244] text-gray-300 hover:bg-[#2E3244]'
                : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
