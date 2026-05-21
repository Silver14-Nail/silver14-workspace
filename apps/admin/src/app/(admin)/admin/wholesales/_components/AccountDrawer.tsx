'use client';

import { useState, useTransition } from 'react';
import { X, Award, CreditCard, Trash2 } from 'lucide-react';
import type { WholesaleAccount, WholesaleTier, UpdateAccountPayload } from '../types';
import { updateAccountAction, deleteAccountAction } from '../actions';

interface Props {
  account: WholesaleAccount;
  tiers: WholesaleTier[];
  onClose: () => void;
  onUpdated: () => void;
}

const TIER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Silver: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  Gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

type ErrResult = { success: false; error: string };
const getErr = (r: unknown) => (r as ErrResult).error ?? 'Unknown error';

export function AccountDrawer({ account, tiers, onClose, onUpdated }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [selectedTierId, setSelectedTierId] = useState(account.tier?.id ?? '');
  const [creditLimit, setCreditLimit] = useState(String(account.creditLimit));
  const [businessName, setBusinessName] = useState(account.businessName ?? '');
  const [country, setCountry] = useState(account.country);
  const [isActive, setIsActive] = useState(account.isActive);

  const handleSave = () => {
    setError('');
    startTransition(async () => {
      const payload: UpdateAccountPayload = {
        businessName: businessName || null,
        country,
        creditLimit: parseFloat(creditLimit) || 0,
        isActive,
        tierId: selectedTierId || undefined,
      };
      const result = await updateAccountAction(account.id, payload);
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      onUpdated();
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteAccountAction(account.id);
      if (!result.success) {
        setError(getErr(result));
        setConfirmDelete(false);
        return;
      }
      onUpdated();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">Wholesale Account</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Contact info */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-sm font-bold text-[#374151]">
                {(account.user?.fullName?.[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{account.user?.fullName}</p>
                <p className="text-xs text-[#9CA3AF]">{account.user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>
            </div>
          </div>

          {/* Tier selection */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Tier
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {tiers.map((tier) => {
                const ts = TIER_STYLES[tier.name] ?? TIER_STYLES['Bronze'];
                const selected = selectedTierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${selected ? `${ts.bg} ${ts.text} ${ts.border}` : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#9CA3AF]'}`}
                  >
                    {tier.name}
                    <p className="text-[10px] font-normal mt-0.5 opacity-70">
                      {tier.discountPercent}% off
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credit & status */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Credit & Status
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Credit Limit (€)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280]">Current Balance:</span>
                <span className="text-xs font-semibold text-[#111827]">
                  €{Number(account.currentBalance).toLocaleString()}
                </span>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative ${isActive ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
                  onClick={() => setIsActive((v) => !v)}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? 'left-5' : 'left-1'}`}
                  />
                </div>
                <span className="text-sm text-[#374151]">
                  {isActive ? 'Account active' : 'Account inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="px-6 py-4">
            <div className="space-y-2 text-xs text-[#6B7280]">
              {account.approvedAt && (
                <p>Approved: {new Date(account.approvedAt).toLocaleDateString()}</p>
              )}
              {account.approvedBy && <p>Approved by: {account.approvedBy.fullName}</p>}
              <p>Created: {new Date(account.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] space-y-2">
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className={`px-3 py-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${confirmDelete ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'border-[#E5E7EB] text-[#6B7280] hover:border-red-300 hover:text-red-600'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#6B7280] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors disabled:opacity-60"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
