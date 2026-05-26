'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SIZE_LABELS } from '../../_constants';
import type { NailSize, SizeLabel } from '../../_types';
import { createNailSizeAction, updateNailSizeAction } from '../../actions';

interface SizeDrawerProps {
  size: NailSize | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SizeDrawer({ size, onClose, onSuccess }: SizeDrawerProps) {
  const isEdit = size !== null;
  const [label, setLabel] = useState<SizeLabel>(size?.label ?? 'M');
  const [sizeCode, setSizeCode] = useState(size?.sizeCode ?? '');
  const [measurements, setMeasurements] = useState(size?.measurements ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = sizeCode.trim() !== '';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');

    const payload = {
      label,
      sizeCode: sizeCode.trim(),
      measurements: measurements.trim() || undefined,
    };

    const result = isEdit
      ? await updateNailSizeAction(size.id, payload)
      : await createNailSizeAction(payload);

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
      <div className="fixed bottom-0 right-0 sm:top-0 w-full sm:w-[480px] h-[90vh] sm:h-full z-50 flex flex-col shadow-2xl bg-white rounded-t-2xl sm:rounded-none overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">
            {isEdit ? 'Edit Nail Size' : 'Add Nail Size'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">Label *</label>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value as SizeLabel)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer text-[#111827] focus:border-[#111827] transition-colors"
            >
              {SIZE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              Size Code * <span className="font-normal text-[#9CA3AF]">(must be unique)</span>
            </label>
            <input
              value={sizeCode}
              onChange={(e) => setSizeCode(e.target.value)}
              placeholder="e.g. M-001"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none text-[#111827] focus:border-[#111827] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#374151]">
              Measurements <span className="font-normal text-[#9CA3AF]">(optional)</span>
            </label>
            <input
              value={measurements}
              onChange={(e) => setMeasurements(e.target.value)}
              placeholder="e.g. width: 14mm, length: 18mm"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none text-[#111827] focus:border-[#111827] transition-colors"
            />
            <p className="text-xs mt-1 text-[#9CA3AF]">Freeform text describing size dimensions</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Size'}
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
