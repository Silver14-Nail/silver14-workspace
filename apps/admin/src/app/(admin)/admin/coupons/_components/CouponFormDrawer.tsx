'use client';

import { useEffect, useState, useTransition } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  CouponDetail,
  DiscountType,
  CreateCouponPayload,
  UpdateCouponPayload,
} from '../types';
import { getCouponAction, createCouponAction, updateCouponAction } from '../actions';

type ErrResult = { success: false; error: string };
const getErr = (r: unknown) => (r as ErrResult).error ?? 'Unknown error';

interface CouponFormDrawerProps {
  couponId: string | null;
  onClose: () => void;
  onSuccess: (coupon: CouponDetail) => void;
}

interface FormState {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  minOrderAmount: string;
  maxUsesTotal: string;
  maxUsesPerUser: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
}

const DEFAULT_FORM: FormState = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  maxUsesTotal: '',
  maxUsesPerUser: '1',
  isActive: true,
  startsAt: '',
  expiresAt: '',
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

export function CouponFormDrawer({ couponId, onClose, onSuccess }: CouponFormDrawerProps) {
  const { t } = useTranslation('coupons');
  const isEdit = couponId !== null;
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!couponId) return;
    setLoading(true);
    getCouponAction(couponId).then((result) => {
      if (!result.success) {
        setError(getErr(result));
        setLoading(false);
        return;
      }
      const c = result.data;
      setForm({
        code: c.code,
        description: c.description ?? '',
        discountType: c.discountType,
        discountValue: String(c.discountValue),
        maxDiscountAmount: c.maxDiscountAmount != null ? String(c.maxDiscountAmount) : '',
        minOrderAmount: c.minOrderAmount > 0 ? String(c.minOrderAmount) : '',
        maxUsesTotal: c.maxUsesTotal != null ? String(c.maxUsesTotal) : '',
        maxUsesPerUser: String(c.maxUsesPerUser),
        isActive: c.isActive,
        startsAt: toDatetimeLocal(c.startsAt),
        expiresAt: toDatetimeLocal(c.expiresAt),
      });
      setLoading(false);
    });
  }, [couponId]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const discountValue = parseFloat(form.discountValue);
    if (!form.code.trim()) {
      setError(t('form.codeRequired'));
      return;
    }
    if (form.discountType !== 'free_shipping' && (isNaN(discountValue) || discountValue <= 0)) {
      setError(t('form.discountRequired'));
      return;
    }

    startTransition(async () => {
      if (isEdit) {
        const payload: UpdateCouponPayload = {
          code: form.code.trim().toUpperCase(),
          description: form.description || null,
          discountType: form.discountType,
          discountValue: form.discountType === 'free_shipping' ? 0 : discountValue,
          maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
          minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
          maxUsesTotal: form.maxUsesTotal ? parseInt(form.maxUsesTotal, 10) : null,
          maxUsesPerUser: form.maxUsesPerUser ? parseInt(form.maxUsesPerUser, 10) : 1,
          isActive: form.isActive,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        };
        const result = await updateCouponAction(couponId!, payload);
        if (!result.success) {
          setError(getErr(result));
          return;
        }
        onSuccess(result.data);
      } else {
        const payload: CreateCouponPayload = {
          code: form.code.trim().toUpperCase(),
          description: form.description || null,
          discountType: form.discountType,
          discountValue: form.discountType === 'free_shipping' ? 0 : discountValue,
          maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
          minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
          maxUsesTotal: form.maxUsesTotal ? parseInt(form.maxUsesTotal, 10) : null,
          maxUsesPerUser: form.maxUsesPerUser ? parseInt(form.maxUsesPerUser, 10) : 1,
          isActive: form.isActive,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        };
        const result = await createCouponAction(payload);
        if (!result.success) {
          setError(getErr(result));
          return;
        }
        onSuccess(result.data);
      }
    });
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
    set('code', code);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-[480px] sm:h-full sm:max-h-screen flex flex-col rounded-t-2xl sm:rounded-none sm:rounded-l-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <h2 className="text-sm font-semibold text-[#111827]">
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF]" />
            </div>
          ) : (
            <form id="coupon-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  {t('form.code')} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.code}
                    onChange={(e) => set('code', e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:bg-[#F3F4F6]"
                  >
                    {t('form.generate')}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  {t('form.description')}
                </label>
                <input
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder={t('form.descriptionPlaceholder')}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  {t('form.discountType')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['percent', 'fixed', 'free_shipping'] as DiscountType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('discountType', type)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${form.discountType === type ? 'bg-[#111827] text-white border-[#111827]' : 'border-[#E5E7EB] text-[#374151] hover:border-[#111827]'}`}
                    >
                      {type === 'percent'
                        ? t('form.typePercent')
                        : type === 'fixed'
                          ? t('form.typeFixed')
                          : t('form.typeFreeShip')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              {form.discountType !== 'free_shipping' && (
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    {form.discountType === 'percent' ? t('form.discountPercent') : t('form.discountAmount')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={form.discountType === 'percent' ? '1' : '0.01'}
                    max={form.discountType === 'percent' ? '100' : undefined}
                    value={form.discountValue}
                    onChange={(e) => set('discountValue', e.target.value)}
                    placeholder={form.discountType === 'percent' ? '10' : '20.00'}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </div>
              )}

              {/* Max Discount Cap (only for percent) */}
              {form.discountType === 'percent' && (
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    {t('form.maxDiscountCap')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxDiscountAmount}
                    onChange={(e) => set('maxDiscountAmount', e.target.value)}
                    placeholder={t('form.unlimited')}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </div>
              )}

              {/* Min Order / Max Uses Per User */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    {t('form.minOrder')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(e) => set('minOrderAmount', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    {t('form.usesPerUser')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUsesPerUser}
                    onChange={(e) => set('maxUsesPerUser', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </div>
              </div>

              {/* Total Usage Limit */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  {t('form.totalUsageLimit')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUsesTotal}
                  onChange={(e) => set('maxUsesTotal', e.target.value)}
                  placeholder={t('form.unlimited')}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                />
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    {t('form.startsAt')}
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => set('startsAt', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    {t('form.expiresAt')}
                  </label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => set('expiresAt', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <div>
                  <p className="text-sm font-medium text-[#374151]">{t('form.activeLabel')}</p>
                  <p className="text-xs text-[#9CA3AF]">{t('form.activeHint')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isActive', !form.isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 shrink-0">
            <button
              type="submit"
              form="coupon-form"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t('form.saveChanges') : t('form.create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6]"
            >
              {t('form.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
