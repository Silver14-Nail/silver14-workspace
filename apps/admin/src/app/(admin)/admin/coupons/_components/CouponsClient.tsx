'use client';

import { useTransition, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Copy,
  Check,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import type {
  CouponListItem,
  CouponListResponse,
  CouponStats,
  CouponListQuery,
  DiscountType,
} from '../types';
import { CouponFormDrawer } from './CouponFormDrawer';
import { CouponDetailDrawer } from './CouponDetailDrawer';

const DISCOUNT_TYPE_STYLES: Record<DiscountType, string> = {
  percent: 'bg-purple-50 text-purple-700 border-purple-200',
  fixed: 'bg-blue-50 text-blue-700 border-blue-200',
  free_shipping: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percent: '% Percent',
  fixed: '$ Fixed',
  free_shipping: 'Free Shipping',
};

function formatDiscount(item: CouponListItem) {
  if (item.discountType === 'percent') return `${item.discountValue}%`;
  if (item.discountType === 'fixed') return `$${item.discountValue}`;
  return 'Free Ship';
}

function CouponCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#9CA3AF] transition-colors group"
    >
      <span className="font-mono text-xs font-semibold text-[#374151]">{code}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3 text-[#9CA3AF] group-hover:text-[#374151]" />
      )}
    </button>
  );
}

interface CouponsClientProps {
  initialCoupons: CouponListResponse;
  initialStats: CouponStats | null;
  currentQuery: CouponListQuery;
}

export function CouponsClient({ initialCoupons, initialStats, currentQuery }: CouponsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [showFormDrawer, setShowFormDrawer] = useState(false);
  const [editCouponId, setEditCouponId] = useState<string | null>(null);
  const [detailCouponId, setDetailCouponId] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      startTransition(async () => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, val]) => {
          if (val === undefined || val === '') {
            params.delete(key);
          } else {
            params.set(key, val);
          }
        });
        if (!('page' in updates)) params.set('page', '1');
        router.push(`/admin/coupons?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const { items, pagination } = initialCoupons;
  const stats = initialStats;

  const sortBy = currentQuery.sortBy ?? 'createdAt';
  const sortOrder = currentQuery.sortOrder ?? 'DESC';

  function toggleSort(field: CouponListQuery['sortBy']) {
    if (sortBy === field) {
      updateParams({ sortBy: field, sortOrder: sortOrder === 'ASC' ? 'DESC' : 'ASC' });
    } else {
      updateParams({ sortBy: field, sortOrder: 'DESC' });
    }
  }

  function SortIcon({ field }: { field: CouponListQuery['sortBy'] }) {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-[#D1D5DB] inline ml-1" />;
    return (
      <ArrowUpDown
        className={`w-3 h-3 inline ml-1 ${sortOrder === 'ASC' ? 'text-[#111827]' : 'text-[#374151]'}`}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Coupons & Promotions</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {stats
              ? `${stats.totalCoupons} coupons · ${stats.totalUsages.toLocaleString()} total uses`
              : `${pagination.totalItems} coupons`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditCouponId(null);
            setShowFormDrawer(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Active', value: stats.activeCoupons },
            { label: 'Total Uses', value: stats.totalUsages.toLocaleString() },
            { label: 'Expiring Soon', value: stats.expiringSoon },
            { label: 'Discount Granted', value: `$${stats.totalDiscountGranted.toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
              <p className="text-xl font-bold text-[#111827]">{s.value}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search coupon codes..."
            defaultValue={currentQuery.search ?? ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParams({ search: e.currentTarget.value });
            }}
            onBlur={(e) => updateParams({ search: e.currentTarget.value })}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <select
          value={
            currentQuery.isActive === true ? 'true' : currentQuery.isActive === false ? 'false' : ''
          }
          onChange={(e) => updateParams({ isActive: e.target.value || undefined })}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={currentQuery.discountType ?? ''}
          onChange={(e) => updateParams({ discountType: e.target.value || undefined })}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
          <option value="free_shipping">Free Shipping</option>
        </select>
        <select
          value={
            currentQuery.isExpired === true
              ? 'true'
              : currentQuery.isExpired === false
                ? 'false'
                : ''
          }
          onChange={(e) => updateParams({ isExpired: e.target.value || undefined })}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="">All Expiry</option>
          <option value="false">Valid</option>
          <option value="true">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('code')}
                    className="flex items-center gap-1 hover:text-[#111827]"
                  >
                    Code <SortIcon field="code" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('discountValue')}
                    className="flex items-center gap-1 hover:text-[#111827]"
                  >
                    Discount <SortIcon field="discountValue" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('usedCount')}
                    className="flex items-center gap-1 hover:text-[#111827]"
                  >
                    Usage <SortIcon field="usedCount" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Min Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  <button
                    onClick={() => toggleSort('expiresAt')}
                    className="flex items-center gap-1 hover:text-[#111827]"
                  >
                    Expires <SortIcon field="expiresAt" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {items.map((coupon) => {
                const usagePct = coupon.maxUsesTotal
                  ? Math.min(100, (coupon.usedCount / coupon.maxUsesTotal) * 100)
                  : null;
                const isExpired = coupon.expiresAt
                  ? new Date(coupon.expiresAt) < new Date()
                  : false;

                return (
                  <tr
                    key={coupon.id}
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    onClick={() => setDetailCouponId(coupon.id)}
                  >
                    <td className="px-4 py-3">
                      <CouponCode code={coupon.code} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${DISCOUNT_TYPE_STYLES[coupon.discountType]}`}
                      >
                        {DISCOUNT_TYPE_LABELS[coupon.discountType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                      {formatDiscount(coupon)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#374151]">
                          {coupon.usedCount}
                        </span>
                        {coupon.maxUsesTotal ? (
                          <>
                            <span className="text-xs text-[#9CA3AF]">/ {coupon.maxUsesTotal}</span>
                            <div className="w-12 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#111827] rounded-full"
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">unlimited</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-[#6B7280]">
                      {coupon.minOrderAmount > 0 ? `$${coupon.minOrderAmount}` : '–'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                      {coupon.expiresAt ? (
                        <span className={isExpired ? 'text-red-500' : ''}>
                          {new Date(coupon.expiresAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${coupon.isActive ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`}
                        />
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditCouponId(coupon.id);
                          setShowFormDrawer(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div className="py-16 text-center">
            <Tag className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No coupons found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            {pagination.totalItems > 0
              ? `Showing ${(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of ${pagination.totalItems}`
              : 'No results'}
          </p>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateParams({ page: String(pagination.currentPage - 1) })}
                disabled={pagination.currentPage <= 1}
                className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-xs text-[#374151]">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: String(pagination.currentPage + 1) })}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Drawer (create / edit) */}
      {showFormDrawer && (
        <CouponFormDrawer
          couponId={editCouponId}
          onClose={() => {
            setShowFormDrawer(false);
            setEditCouponId(null);
          }}
          onSuccess={() => {
            setShowFormDrawer(false);
            setEditCouponId(null);
            router.refresh();
          }}
        />
      )}

      {/* Detail Drawer */}
      {detailCouponId && (
        <CouponDetailDrawer
          couponId={detailCouponId}
          onClose={() => setDetailCouponId(null)}
          onEdit={(id) => {
            setDetailCouponId(null);
            setEditCouponId(id);
            setShowFormDrawer(true);
          }}
          onDeleted={() => {
            setDetailCouponId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
