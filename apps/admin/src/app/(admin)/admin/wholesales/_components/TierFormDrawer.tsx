'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import type { WholesaleTier, WholesaleTierName, CreateTierPayload, UpdateTierPayload } from '../types';
import { createTierAction, updateTierAction } from '../actions';

interface Props {
  tier?: WholesaleTier | null;
  existingNames?: WholesaleTierName[];
  onClose: () => void;
  onSaved: (tier: WholesaleTier) => void;
}

const ALL_TIER_NAMES: WholesaleTierName[] = ['Bronze', 'Silver', 'Gold'];

const TIER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Silver: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  Gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

type ErrResult = { success: false; error: string };
const getErr = (r: unknown) => (r as ErrResult).error ?? 'Unknown error';

export function TierFormDrawer({ tier, existingNames = [], onClose, onSaved }: Props) {
  const isCreate = !tier;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const availableNames = ALL_TIER_NAMES.filter((n) => !existingNames.includes(n));
  const [selectedName, setSelectedName] = useState<WholesaleTierName>(
    availableNames[0] ?? 'Bronze',
  );

  const [discountPercent, setDiscountPercent] = useState(String(tier?.discountPercent ?? 0));
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    tier?.maxDiscountAmount != null ? String(tier.maxDiscountAmount) : '',
  );
  const [minMonthlyQty, setMinMonthlyQty] = useState(String(tier?.minMonthlyQty ?? 0));
  const [minOrderAmount, setMinOrderAmount] = useState(String(tier?.minOrderAmount ?? 0));
  const [freeShipping, setFreeShipping] = useState(tier?.freeShipping ?? false);

  const displayName = isCreate ? selectedName : tier.name;
  const ts = TIER_STYLES[displayName] ?? TIER_STYLES['Bronze'];

  const handleSave = () => {
    const pct = parseFloat(discountPercent);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError('Discount percent must be between 0 and 100');
      return;
    }
    setError('');
    startTransition(async () => {
      const sharedFields = {
        discountPercent: pct,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        minMonthlyQty: parseInt(minMonthlyQty, 10) || 0,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        freeShipping,
      };

      let result;
      if (isCreate) {
        const payload: CreateTierPayload = { name: selectedName, ...sharedFields };
        result = await createTierAction(payload);
      } else {
        const payload: UpdateTierPayload = sharedFields;
        result = await updateTierAction(tier.id, payload);
      }

      if (!result.success) {
        setError(getErr(result));
        return;
      }
      onSaved(result.data);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${ts.bg} ${ts.text} ${ts.border}`}
            >
              {displayName}
            </span>
            <h2 className="text-sm font-semibold text-[#111827]">
              {isCreate ? 'Add New Tier' : 'Edit Tier Settings'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Tier name selector (create only) */}
          {isCreate && (
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Tier Name</label>
              {availableNames.length === 0 ? (
                <p className="text-sm text-red-600">All tiers already exist.</p>
              ) : (
                <div className="flex gap-2">
                  {availableNames.map((name) => {
                    const s = TIER_STYLES[name];
                    return (
                      <button
                        key={name}
                        onClick={() => setSelectedName(name)}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          selectedName === name
                            ? `${s.bg} ${s.text} ${s.border} border-2`
                            : 'border-[#E5E7EB] text-[#374151] hover:border-[#111827]'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Discount */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Discount Percent (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
            />
            <p className="text-xs text-[#9CA3AF] mt-1">
              Percentage discount applied to wholesale orders for this tier.
            </p>
          </div>

          {/* Max discount cap */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Max Discount Amount ($) — optional cap
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
              placeholder="No cap"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
            />
            <p className="text-xs text-[#9CA3AF] mt-1">
              Leave blank to apply no cap on the discount amount.
            </p>
          </div>

          {/* Min monthly qty */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Minimum Monthly Quantity (sets)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={minMonthlyQty}
              onChange={(e) => setMinMonthlyQty(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
            />
          </div>

          {/* Min order amount */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Minimum Order Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
            />
          </div>

          {/* Free shipping */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${freeShipping ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
                onClick={() => setFreeShipping((v) => !v)}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${freeShipping ? 'left-5' : 'left-1'}`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#374151]">Free Shipping</p>
                <p className="text-xs text-[#9CA3AF]">
                  Waive shipping fees for all orders in this tier.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] space-y-2">
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || (isCreate && availableNames.length === 0)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors disabled:opacity-60"
            >
              {isPending ? 'Saving...' : isCreate ? 'Create Tier' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
