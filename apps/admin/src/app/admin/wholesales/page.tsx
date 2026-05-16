'use client';

import { useState } from 'react';
import {
  Search,
  Building2,
  CheckCircle,
  XCircle,
  X,
  TrendingUp,
  CreditCard,
  Award,
} from 'lucide-react';
import { mockWholesale, type WholesaleAccount } from '../../../MOCK_DATAS/mockData';

const tierColors = {
  bronze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🥉' },
  silver: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '🥈' },
  gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '🥇' },
};

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

function WholesaleDrawer({ account, onClose }: { account: WholesaleAccount; onClose: () => void }) {
  const tier = tierColors[account.tier];
  const [selectedTier, setSelectedTier] = useState<WholesaleAccount['tier']>(account.tier);

  const mockOrders = [
    { num: 'WS-001', date: '2026-05-01', total: 480, status: 'delivered' },
    { num: 'WS-002', date: '2026-04-15', total: 320, status: 'delivered' },
    { num: 'WS-003', date: '2026-04-02', total: 610, status: 'delivered' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">Wholesale Account</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl ${tier.bg} flex items-center justify-center text-2xl`}
                >
                  {tier.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{account.businessName}</p>
                  <p className="text-xs text-[#6B7280]">{account.contactName}</p>
                  <p className="text-xs text-[#9CA3AF]">{account.email}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[account.status]}`}
              >
                {account.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Country', value: account.country },
                { label: 'Total Orders', value: account.totalOrders },
                { label: 'Total Revenue', value: `€${account.totalRevenue.toLocaleString()}` },
              ].map((s) => (
                <div key={s.label} className="bg-[#F9FAFB] rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-[#111827]">{s.value}</p>
                  <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier & Credit */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Account Tier
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['bronze', 'silver', 'gold'] as WholesaleAccount['tier'][]).map((t) => {
                const tc = tierColors[t];
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors flex flex-col items-center gap-1 ${selectedTier === t ? `${tc.bg} ${tc.text} ${tc.border}` : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#9CA3AF]'}`}
                  >
                    <span className="text-lg">{tc.icon}</span>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B7280] flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Credit Balance
                  </span>
                  <span className="font-semibold text-[#111827]">
                    €{account.creditBalance} / €{account.creditLimit}
                  </span>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#111827] rounded-full"
                    style={{ width: `${(account.creditBalance / account.creditLimit) * 100}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 bg-[#F9FAFB] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Payment Terms</p>
                  <p className="text-xs font-medium text-[#111827]">Net 30</p>
                </div>
                <div className="px-3 py-2 bg-[#F9FAFB] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Wholesale Discount</p>
                  <p className="text-xs font-medium text-[#111827]">
                    {account.tier === 'gold' ? '20%' : account.tier === 'silver' ? '15%' : '10%'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Rules */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Pricing Rules
            </h3>
            <div className="space-y-2">
              {[
                {
                  rule: 'Base wholesale discount',
                  value:
                    account.tier === 'gold' ? '20%' : account.tier === 'silver' ? '15%' : '10%',
                },
                {
                  rule: 'Min. order quantity',
                  value: account.tier === 'gold' ? '20 sets' : '10 sets',
                },
                { rule: 'Free shipping threshold', value: '€200+' },
                {
                  rule: 'Custom sizing',
                  value: account.tier !== 'bronze' ? 'Included' : 'Not included',
                },
              ].map((r) => (
                <div
                  key={r.rule}
                  className="flex justify-between py-1.5 border-b border-[#F3F4F6] last:border-0"
                >
                  <span className="text-xs text-[#6B7280]">{r.rule}</span>
                  <span className="text-xs font-medium text-[#111827]">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Recent Orders
            </h3>
            {account.totalOrders > 0 ? (
              <div className="space-y-2">
                {mockOrders.map((order) => (
                  <div
                    key={order.num}
                    className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0"
                  >
                    <div>
                      <p className="text-xs font-medium text-[#111827]">{order.num}</p>
                      <p className="text-xs text-[#9CA3AF]">{order.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#111827]">€{order.total}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF] py-2">No orders yet</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#E5E7EB]">
          {account.status === 'pending' || account.status === 'reviewing' ? (
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          ) : (
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminWholesalePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<WholesaleAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'enquiries'>('all');

  const filtered = mockWholesale.filter((a) => {
    const matchSearch =
      search === '' ||
      a.businessName.toLowerCase().includes(search.toLowerCase()) ||
      a.contactName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const enquiries = filtered.filter((a) => a.status === 'pending' || a.status === 'reviewing');

  const displayed = activeTab === 'enquiries' ? enquiries : filtered;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Wholesale Management</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {mockWholesale.filter((a) => a.status === 'approved').length} active accounts ·{' '}
            {enquiries.length} pending enquiries
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Accounts', value: mockWholesale.length },
          { label: 'Approved', value: mockWholesale.filter((a) => a.status === 'approved').length },
          { label: 'Pending Review', value: enquiries.length },
          { label: 'Wholesale Revenue', value: '€13,490' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: `All Accounts (${filtered.length})` },
          { key: 'enquiries', label: `Pending Enquiries (${enquiries.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'all' | 'enquiries')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.key ? 'bg-[#111827] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search businesses..."
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
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((account) => {
          const tier = tierColors[account.tier];
          return (
            <div
              key={account.id}
              className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAccount(account)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${tier.bg} flex items-center justify-center text-xl`}
                  >
                    {tier.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{account.businessName}</p>
                    <p className="text-xs text-[#6B7280]">{account.country}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[account.status]}`}
                >
                  {account.status}
                </span>
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-xs text-[#6B7280]">{account.contactName}</p>
                <p className="text-xs text-[#9CA3AF]">{account.email}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F3F4F6]">
                <div>
                  <p className="text-xs font-bold text-[#111827]">{account.totalOrders}</p>
                  <p className="text-xs text-[#9CA3AF]">Orders</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111827]">
                    €{account.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">Revenue</p>
                </div>
                <div>
                  <p className={`text-xs font-bold ${tier.text}`}>
                    {account.tier.charAt(0).toUpperCase() + account.tier.slice(1)}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">Tier</p>
                </div>
              </div>
              {(account.status === 'pending' || account.status === 'reviewing') && (
                <div className="mt-3 flex gap-2">
                  <button
                    className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Approve
                  </button>
                  <button
                    className="flex-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] py-16 text-center">
          <Building2 className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#9CA3AF]">No wholesale accounts found</p>
        </div>
      )}

      {selectedAccount && (
        <WholesaleDrawer account={selectedAccount} onClose={() => setSelectedAccount(null)} />
      )}
    </div>
  );
}
