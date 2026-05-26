'use client';

import { useState, useTransition } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import type { WholesaleEnquiry, WholesaleTier, WholesaleEnquiryStatus } from '../types';
import { updateEnquiryAction, approveEnquiryAction, rejectEnquiryAction } from '../actions';

interface Props {
  enquiry: WholesaleEnquiry;
  tiers: WholesaleTier[];
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

type ErrResult = { success: false; error: string };
const getErr = (r: unknown) => (r as ErrResult).error ?? 'Unknown error';

export function EnquiryDrawer({ enquiry, tiers, onClose, onUpdated }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [adminNotes, setAdminNotes] = useState(enquiry.adminNotes ?? '');
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState(tiers[0]?.id ?? '');

  const isActionable = enquiry.status === 'pending' || enquiry.status === 'reviewing';

  const handleMarkReviewing = () => {
    setError('');
    startTransition(async () => {
      const result = await updateEnquiryAction(enquiry.id, {
        status: 'reviewing' as WholesaleEnquiryStatus,
      });
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      onUpdated();
    });
  };

  const handleSaveNotes = () => {
    setError('');
    startTransition(async () => {
      const result = await updateEnquiryAction(enquiry.id, { adminNotes: adminNotes || null });
      if (!result.success) {
        setError(getErr(result));
      }
    });
  };

  const handleApprove = () => {
    if (!selectedTierId) {
      setError('Select a tier to approve');
      return;
    }
    setError('');
    startTransition(async () => {
      const result = await approveEnquiryAction(enquiry.id, { tierId: selectedTierId });
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      onUpdated();
    });
  };

  const handleReject = () => {
    setError('');
    startTransition(async () => {
      const result = await rejectEnquiryAction(enquiry.id);
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      onUpdated();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white h-[90vh] sm:h-full shadow-2xl flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-[#111827]">Wholesale Enquiry</h2>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[enquiry.status]}`}
            >
              {enquiry.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Applicant details */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Applicant
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Name" value={`${enquiry.firstName} ${enquiry.lastName}`} />
              <InfoItem label="Email" value={enquiry.email} />
              <InfoItem label="Phone" value={enquiry.phone} />
              <InfoItem label="Country" value={enquiry.country} />
            </div>
          </div>

          {/* Business details */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Business
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Business Name" value={enquiry.businessName ?? '—'} />
              <InfoItem label="Type" value={enquiry.businessType ?? '—'} />
              <InfoItem label="Monthly Qty" value={enquiry.monthlyOrderQtyRange ?? '—'} />
              {enquiry.collectionsOfInterest && enquiry.collectionsOfInterest.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6B7280] mb-1">Collections of Interest</p>
                  <div className="flex flex-wrap gap-1">
                    {enquiry.collectionsOfInterest.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 bg-[#F3F4F6] text-xs text-[#374151] rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {enquiry.additionalMessage && (
              <div className="mt-3 p-3 bg-[#F9FAFB] rounded-lg text-xs text-[#374151]">
                {enquiry.additionalMessage}
              </div>
            )}
          </div>

          {/* Admin notes */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Admin Notes
            </h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes..."
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isPending}
              className="mt-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#374151] hover:border-[#111827] transition-colors disabled:opacity-60"
            >
              Save Notes
            </button>
          </div>

          {/* Approve form */}
          {showApproveForm && (
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-emerald-50">
              <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">
                Approve — Assign Tier
              </h3>
              <p className="text-xs text-emerald-700 mb-3">
                A wholesale account will be created automatically if this email matches an existing
                user.
              </p>
              <select
                value={selectedTierId}
                onChange={(e) => setSelectedTierId(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none focus:border-emerald-500 bg-white mb-3"
              >
                {tiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.discountPercent}% discount
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isPending ? 'Approving...' : 'Confirm Approve'}
                </button>
                <button
                  onClick={() => setShowApproveForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#374151] hover:bg-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="px-6 py-4">
            <div className="space-y-1 text-xs text-[#9CA3AF]">
              <p>Submitted: {new Date(enquiry.createdAt).toLocaleString()}</p>
              {enquiry.respondedAt && (
                <p>Responded: {new Date(enquiry.respondedAt).toLocaleString()}</p>
              )}
              {enquiry.handledBy && <p>Handled by: {enquiry.handledBy.fullName}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] space-y-2">
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {isActionable && !showApproveForm && (
            <div className="flex gap-2">
              {enquiry.status === 'pending' && (
                <button
                  onClick={handleMarkReviewing}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors disabled:opacity-60"
                >
                  Mark Reviewing
                </button>
              )}
              <button
                onClick={() => setShowApproveForm(true)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          )}

          {!isActionable && (
            <p className="text-xs text-center text-[#9CA3AF]">
              This enquiry has been {enquiry.status}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#6B7280] mb-0.5">{label}</p>
      <p className="text-sm text-[#111827] font-medium">{value}</p>
    </div>
  );
}
