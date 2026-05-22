'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  X,
  Loader2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  BarChart2,
} from 'lucide-react';
import type {
  CouponDetail,
  CouponRestriction,
  CouponRestrictionType,
  CouponUsageListResponse,
  AddRestrictionPayload,
} from '../types';
import {
  getCouponAction,
  activateCouponAction,
  deactivateCouponAction,
  deleteCouponAction,
  addRestrictionAction,
  removeRestrictionAction,
  addToWhitelistAction,
  removeFromWhitelistAction,
  getCouponUsagesAction,
} from '../actions';

type ErrResult = { success: false; error: string };
const getErr = (r: unknown) => (r as ErrResult).error ?? 'Unknown error';

const RESTRICTION_TYPE_LABELS: Record<CouponRestrictionType, string> = {
  product: 'Specific Product',
  shape: 'Nail Shape',
  category: 'Category',
  min_qty: 'Min. Quantity',
  new_user: 'New Users Only',
};

interface CouponDetailDrawerProps {
  couponId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDeleted: () => void;
}

type TabId = 'info' | 'restrictions' | 'whitelist' | 'usages';

export function CouponDetailDrawer({
  couponId,
  onClose,
  onEdit,
  onDeleted,
}: CouponDetailDrawerProps) {
  const [coupon, setCoupon] = useState<CouponDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [isPending, startTransition] = useTransition();

  // Restriction form
  const [showRestrictionForm, setShowRestrictionForm] = useState(false);
  const [restrictionType, setRestrictionType] = useState<CouponRestrictionType>('new_user');
  const [restrictionRefId, setRestrictionRefId] = useState('');
  const [restrictionRefLabel, setRestrictionRefLabel] = useState('');
  const [restrictionError, setRestrictionError] = useState<string | null>(null);

  // Whitelist form
  const [showWhitelistForm, setShowWhitelistForm] = useState(false);
  const [whitelistUserId, setWhitelistUserId] = useState('');
  const [whitelistError, setWhitelistError] = useState<string | null>(null);

  // Usages pagination
  const [usagesPage, setUsagesPage] = useState(1);
  const [usagesData, setUsagesData] = useState<CouponUsageListResponse | null>(null);
  const [usagesLoading, setUsagesLoading] = useState(false);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState(false);

  function reload() {
    setLoading(true);
    getCouponAction(couponId).then((result) => {
      if (!result.success) {
        setError(getErr(result));
        setLoading(false);
        return;
      }
      setCoupon(result.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    reload();
  }, [couponId]);

  useEffect(() => {
    if (activeTab !== 'usages') return;
    setUsagesLoading(true);
    getCouponUsagesAction(couponId, usagesPage, 10).then((result) => {
      if (result.success) setUsagesData(result.data);
      setUsagesLoading(false);
    });
  }, [activeTab, couponId, usagesPage]);

  function handleToggleActive() {
    if (!coupon) return;
    startTransition(async () => {
      const action = coupon.isActive ? deactivateCouponAction : activateCouponAction;
      const result = await action(couponId);
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      setCoupon(result.data);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCouponAction(couponId);
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      onDeleted();
    });
  }

  function handleAddRestriction() {
    setRestrictionError(null);
    const needsRef = ['product', 'shape', 'category', 'min_qty'].includes(restrictionType);
    if (needsRef && !restrictionRefId.trim()) {
      setRestrictionError('Reference ID is required for this restriction type');
      return;
    }
    startTransition(async () => {
      const payload: AddRestrictionPayload = {
        restrictionType,
        refId: restrictionRefId.trim() || null,
        refLabel: restrictionRefLabel.trim() || null,
      };
      const result = await addRestrictionAction(couponId, payload);
      if (!result.success) {
        setRestrictionError(getErr(result));
        return;
      }
      setShowRestrictionForm(false);
      setRestrictionRefId('');
      setRestrictionRefLabel('');
      reload();
    });
  }

  function handleRemoveRestriction(restrictionId: string) {
    startTransition(async () => {
      const result = await removeRestrictionAction(couponId, restrictionId);
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      reload();
    });
  }

  function handleAddToWhitelist() {
    setWhitelistError(null);
    if (!whitelistUserId.trim()) {
      setWhitelistError('User ID is required');
      return;
    }
    startTransition(async () => {
      const result = await addToWhitelistAction(couponId, whitelistUserId.trim());
      if (!result.success) {
        setWhitelistError(getErr(result));
        return;
      }
      setShowWhitelistForm(false);
      setWhitelistUserId('');
      reload();
    });
  }

  function handleRemoveFromWhitelist(whitelistId: string) {
    startTransition(async () => {
      const result = await removeFromWhitelistAction(couponId, whitelistId);
      if (!result.success) {
        setError(getErr(result));
        return;
      }
      reload();
    });
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Info', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    {
      id: 'restrictions',
      label: `Restrictions ${coupon ? `(${coupon.restrictions.length})` : ''}`,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'whitelist',
      label: `Whitelist ${coupon ? `(${coupon.whitelist.length})` : ''}`,
      icon: <Users className="w-3.5 h-3.5" />,
    },
    { id: 'usages', label: 'Usages', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-[520px] sm:h-full flex flex-col rounded-t-2xl sm:rounded-none sm:rounded-l-2xl shadow-2xl max-h-[90vh] sm:max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              {loading ? 'Loading…' : coupon ? coupon.code : 'Coupon Detail'}
            </h2>
            {coupon && (
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {coupon.description ?? 'No description'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        {coupon && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
            <button
              onClick={() => onEdit(couponId)}
              className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#374151] hover:bg-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${coupon.isActive ? 'border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
            >
              {coupon.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <div className="flex-1" />
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Confirm delete?</span>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        {coupon && (
          <div className="flex items-center gap-1 px-6 py-2 border-b border-[#E5E7EB] shrink-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF]" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : coupon ? (
            <>
              {activeTab === 'info' && <InfoTab coupon={coupon} />}
              {activeTab === 'restrictions' && (
                <RestrictionsTab
                  coupon={coupon}
                  isPending={isPending}
                  showForm={showRestrictionForm}
                  restrictionType={restrictionType}
                  refId={restrictionRefId}
                  refLabel={restrictionRefLabel}
                  formError={restrictionError}
                  onShowForm={() => setShowRestrictionForm(true)}
                  onHideForm={() => {
                    setShowRestrictionForm(false);
                    setRestrictionError(null);
                  }}
                  onTypeChange={setRestrictionType}
                  onRefIdChange={setRestrictionRefId}
                  onRefLabelChange={setRestrictionRefLabel}
                  onAdd={handleAddRestriction}
                  onRemove={handleRemoveRestriction}
                />
              )}
              {activeTab === 'whitelist' && (
                <WhitelistTab
                  coupon={coupon}
                  isPending={isPending}
                  showForm={showWhitelistForm}
                  userId={whitelistUserId}
                  formError={whitelistError}
                  onShowForm={() => setShowWhitelistForm(true)}
                  onHideForm={() => {
                    setShowWhitelistForm(false);
                    setWhitelistError(null);
                  }}
                  onUserIdChange={setWhitelistUserId}
                  onAdd={handleAddToWhitelist}
                  onRemove={handleRemoveFromWhitelist}
                />
              )}
              {activeTab === 'usages' && (
                <UsagesTab
                  loading={usagesLoading}
                  data={usagesData}
                  page={usagesPage}
                  onPageChange={setUsagesPage}
                />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Info Tab ────────────────────────────────────────────────────────────────

function InfoTab({ coupon }: { coupon: CouponDetail }) {
  const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;

  function fmt(val: string | null | undefined) {
    if (!val) return '–';
    return new Date(val).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Status',
      value: (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${coupon.isActive ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`}
          />
          {coupon.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { label: 'Discount Type', value: coupon.discountType.replace(/_/g, ' ') },
    {
      label: 'Discount Value',
      value:
        coupon.discountType === 'percent'
          ? `${coupon.discountValue}%`
          : coupon.discountType === 'fixed'
            ? `$${coupon.discountValue}`
            : 'Free Shipping',
    },
    {
      label: 'Max Discount Cap',
      value: coupon.maxDiscountAmount != null ? `$${coupon.maxDiscountAmount}` : '–',
    },
    {
      label: 'Min Order Amount',
      value: coupon.minOrderAmount > 0 ? `$${coupon.minOrderAmount}` : '–',
    },
    {
      label: 'Max Uses (Total)',
      value: coupon.maxUsesTotal != null ? String(coupon.maxUsesTotal) : 'Unlimited',
    },
    { label: 'Max Uses per User', value: String(coupon.maxUsesPerUser) },
    { label: 'Used Count', value: String(coupon.usedCount) },
    { label: 'Starts At', value: fmt(coupon.startsAt) },
    {
      label: 'Expires At',
      value: coupon.expiresAt ? (
        <span className={isExpired ? 'text-red-500' : ''}>
          {fmt(coupon.expiresAt)}
          {isExpired ? ' (expired)' : ''}
        </span>
      ) : (
        '–'
      ),
    },
    { label: 'Created', value: fmt(coupon.createdAt) },
  ];

  return (
    <div className="p-6">
      <dl className="space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <dt className="text-xs text-[#9CA3AF] shrink-0 w-36">{label}</dt>
            <dd className="text-xs font-medium text-[#374151] text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Restrictions Tab ─────────────────────────────────────────────────────────

interface RestrictionsTabProps {
  coupon: CouponDetail;
  isPending: boolean;
  showForm: boolean;
  restrictionType: CouponRestrictionType;
  refId: string;
  refLabel: string;
  formError: string | null;
  onShowForm: () => void;
  onHideForm: () => void;
  onTypeChange: (t: CouponRestrictionType) => void;
  onRefIdChange: (v: string) => void;
  onRefLabelChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

function RestrictionsTab({
  coupon,
  isPending,
  showForm,
  restrictionType,
  refId,
  refLabel,
  formError,
  onShowForm,
  onHideForm,
  onTypeChange,
  onRefIdChange,
  onRefLabelChange,
  onAdd,
  onRemove,
}: RestrictionsTabProps) {
  const needsRef = ['product', 'shape', 'category', 'min_qty'].includes(restrictionType);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#374151]">
          Restrictions ({coupon.restrictions.length})
        </p>
        {!showForm && (
          <button
            onClick={onShowForm}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-[#F3F4F6]"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-3">
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Type</label>
            <select
              value={restrictionType}
              onChange={(e) => onTypeChange(e.target.value as CouponRestrictionType)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] bg-white"
            >
              {(Object.entries(RESTRICTION_TYPE_LABELS) as [CouponRestrictionType, string][]).map(
                ([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ),
              )}
            </select>
          </div>
          {needsRef && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Reference ID
                </label>
                <input
                  value={refId}
                  onChange={(e) => onRefIdChange(e.target.value)}
                  placeholder="UUID or numeric ID"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Reference Label
                </label>
                <input
                  value={refLabel}
                  onChange={(e) => onRefLabelChange(e.target.value)}
                  placeholder="Display name (optional)"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] disabled:opacity-60"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Restriction
            </button>
            <button
              onClick={onHideForm}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {coupon.restrictions.length === 0 && !showForm && (
        <p className="text-sm text-[#9CA3AF] text-center py-8">
          No restrictions — coupon applies to all orders
        </p>
      )}

      <div className="space-y-2">
        {coupon.restrictions.map((r: CouponRestriction) => (
          <div
            key={r.id}
            className="flex items-start justify-between gap-3 p-3 rounded-xl border border-[#E5E7EB]"
          >
            <div>
              <p className="text-xs font-semibold text-[#374151]">
                {RESTRICTION_TYPE_LABELS[r.restrictionType]}
              </p>
              {r.refLabel && <p className="text-xs text-[#6B7280] mt-0.5">{r.refLabel}</p>}
              {r.refId && <p className="font-mono text-xs text-[#9CA3AF]">{r.refId}</p>}
            </div>
            <button
              onClick={() => onRemove(r.id)}
              disabled={isPending}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Whitelist Tab ────────────────────────────────────────────────────────────

interface WhitelistTabProps {
  coupon: CouponDetail;
  isPending: boolean;
  showForm: boolean;
  userId: string;
  formError: string | null;
  onShowForm: () => void;
  onHideForm: () => void;
  onUserIdChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

function WhitelistTab({
  coupon,
  isPending,
  showForm,
  userId,
  formError,
  onShowForm,
  onHideForm,
  onUserIdChange,
  onAdd,
  onRemove,
}: WhitelistTabProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#374151]">
          Whitelisted Users ({coupon.whitelist.length})
        </p>
        {!showForm && (
          <button
            onClick={onShowForm}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-[#F3F4F6]"
          >
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-3">
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              User ID (UUID)
            </label>
            <input
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-mono outline-none focus:border-[#111827]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] disabled:opacity-60"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add to Whitelist
            </button>
            <button
              onClick={onHideForm}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {coupon.whitelist.length === 0 && !showForm && (
        <p className="text-sm text-[#9CA3AF] text-center py-8">
          No users whitelisted — coupon is available to everyone
        </p>
      )}

      <div className="space-y-2">
        {coupon.whitelist.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E5E7EB]"
          >
            <div>
              <p className="text-xs font-semibold text-[#374151]">{entry.user.fullName}</p>
              <p className="text-xs text-[#9CA3AF]">{entry.user.email}</p>
            </div>
            <button
              onClick={() => onRemove(entry.id)}
              disabled={isPending}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Usages Tab ───────────────────────────────────────────────────────────────

function UsagesTab({
  loading,
  data,
  page,
  onPageChange,
}: {
  loading: boolean;
  data: CouponUsageListResponse | null;
  page: number;
  onPageChange: (p: number) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF]" />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return <p className="text-sm text-[#9CA3AF] text-center py-16">No usage records yet</p>;
  }

  return (
    <div className="p-6 space-y-3">
      <p className="text-xs font-semibold text-[#374151]">
        Usage History ({data.pagination.totalItems} total)
      </p>
      <div className="space-y-2">
        {data.items.map((usage) => (
          <div key={usage.id} className="p-3 rounded-xl border border-[#E5E7EB] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#374151]">
                {usage.user?.fullName ?? 'Guest'}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                –${usage.discountApplied.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9CA3AF]">{usage.user?.email ?? ''}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  usage.order.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : usage.order.status === 'cancelled'
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
                }`}
              >
                {usage.order.status}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              {new Date(usage.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#6B7280]">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= data.pagination.totalPages}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
