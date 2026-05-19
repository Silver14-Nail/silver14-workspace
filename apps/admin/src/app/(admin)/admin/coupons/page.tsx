'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Tag, Copy, Check } from 'lucide-react';
import { mockCoupons, type AdminCoupon } from '../../../../MOCK_DATAS/mockData';

type DiscountType = 'percent' | 'fixed' | 'free_shipping';

const discountTypeColors: Record<DiscountType, string> = {
  percent: 'bg-purple-50 text-purple-700 border-purple-200',
  fixed: 'bg-blue-50 text-blue-700 border-blue-200',
  free_shipping: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function formatDiscount(coupon: AdminCoupon) {
  if (coupon.discountType === 'percent') return `${coupon.discountValue}% off`;
  if (coupon.discountType === 'fixed') return `€${coupon.discountValue} off`;
  return 'Free Shipping';
}

function CouponModal({ coupon, onClose }: { coupon: AdminCoupon | null; onClose: () => void }) {
  const isEdit = coupon !== null;
  const [discountType, setDiscountType] = useState<DiscountType>(coupon?.discountType || 'percent');
  const [active, setActive] = useState(coupon?.active ?? true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">
            {isEdit ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Coupon Code</label>
            <div className="flex gap-2">
              <input
                defaultValue={coupon?.code}
                placeholder="e.g. SUMMER20"
                className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] uppercase"
              />
              <button className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:bg-[#F3F4F6]">
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Discount Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['percent', 'fixed', 'free_shipping'] as DiscountType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setDiscountType(type)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${discountType === type ? 'bg-[#111827] text-white border-[#111827]' : 'border-[#E5E7EB] text-[#374151] hover:border-[#111827]'}`}
                >
                  {type === 'percent' ? '% Percent' : type === 'fixed' ? '€ Fixed' : '🚚 Free Ship'}
                </button>
              ))}
            </div>
          </div>

          {discountType !== 'free_shipping' && (
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                {discountType === 'percent' ? 'Discount Percentage' : 'Discount Amount (€)'}
              </label>
              <input
                type="number"
                defaultValue={coupon?.discountValue}
                placeholder={discountType === 'percent' ? '10' : '20.00'}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Min. Order Amount (€)
              </label>
              <input
                type="number"
                defaultValue={coupon?.minOrderAmount || ''}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Usage Limit
              </label>
              <input
                type="number"
                defaultValue={coupon?.usageLimit || ''}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Expiry Date</label>
            <input
              type="datetime-local"
              defaultValue={coupon?.expiresAt?.slice(0, 16)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
            />
          </div>

          {/* Restrictions */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-2">Restrictions</label>
            <div className="space-y-2">
              {[
                { id: 'new_user', label: 'New users only' },
                { id: 'one_per', label: 'One use per customer' },
                { id: 'min_qty', label: 'Minimum quantity requirement' },
              ].map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-3 px-3 py-2.5 border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#9CA3AF] transition-colors"
                >
                  <input type="checkbox" className="rounded" />
                  <span className="text-xs text-[#374151]">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
            <div>
              <p className="text-sm font-medium text-[#374151]">Active</p>
              <p className="text-xs text-[#9CA3AF]">Coupon is usable by customers</p>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${active ? 'bg-[#111827]' : 'bg-[#D1D5DB]'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
            {isEdit ? 'Save Changes' : 'Create Coupon'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CouponCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
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

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<AdminCoupon | null>(null);

  const filtered = mockCoupons.filter((c) => {
    const matchSearch = search === '' || c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? c.active : !c.active);
    const matchType = typeFilter === 'all' || c.discountType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalUsage = mockCoupons.reduce((sum, c) => sum + c.usageCount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Coupons & Promotions</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {mockCoupons.length} coupons · {totalUsage.toLocaleString()} total uses
          </p>
        </div>
        <button
          onClick={() => {
            setEditCoupon(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Active Coupons', value: mockCoupons.filter((c) => c.active).length },
          { label: 'Total Uses', value: totalUsage.toLocaleString() },
          { label: 'Expiring Soon', value: 1 },
          { label: 'Avg. Uses / Coupon', value: Math.round(totalUsage / mockCoupons.length) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search coupon codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
          <option value="free_shipping">Free Shipping</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Min Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Expires
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
              {filtered.map((coupon) => {
                const usagePct = coupon.usageLimit
                  ? Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100)
                  : null;
                return (
                  <tr key={coupon.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <CouponCode code={coupon.code} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${discountTypeColors[coupon.discountType]}`}
                      >
                        {coupon.discountType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                      {formatDiscount(coupon)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#374151]">
                          {coupon.usageCount}
                        </span>
                        {coupon.usageLimit && (
                          <>
                            <span className="text-xs text-[#9CA3AF]">/ {coupon.usageLimit}</span>
                            <div className="w-12 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#111827] rounded-full"
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                          </>
                        )}
                        {!coupon.usageLimit && (
                          <span className="text-xs text-[#9CA3AF]">unlimited</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-[#6B7280]">
                      {coupon.minOrderAmount ? `€${coupon.minOrderAmount}` : '–'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '–'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${coupon.active ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${coupon.active ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`}
                        />
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditCoupon(coupon);
                            setShowModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Tag className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No coupons found</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {filtered.length} of {mockCoupons.length} coupons
          </p>
        </div>
      </div>

      {showModal && (
        <CouponModal
          coupon={editCoupon}
          onClose={() => {
            setShowModal(false);
            setEditCoupon(null);
          }}
        />
      )}
    </div>
  );
}
