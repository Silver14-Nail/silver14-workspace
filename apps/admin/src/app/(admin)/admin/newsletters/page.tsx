'use client';

import { useState } from 'react';
import { Search, Download, Trash2, Mail, TrendingUp, UserMinus, UserPlus } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockSubscribers } from '../../../../MOCK_DATAS/mockData';

const sourceColors: Record<string, string> = {
  footer: 'bg-blue-50 text-blue-700 border-blue-200',
  checkout: 'bg-purple-50 text-purple-700 border-purple-200',
  popup: 'bg-amber-50 text-amber-700 border-amber-200',
  wholesale: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const growthData = [
  { month: 'Nov 25', subscribers: 48 },
  { month: 'Dec 25', subscribers: 87 },
  { month: 'Jan 26', subscribers: 124 },
  { month: 'Feb 26', subscribers: 156 },
  { month: 'Mar 26', subscribers: 198 },
  { month: 'Apr 26', subscribers: 234 },
  { month: 'May 26', subscribers: 247 },
];

const sourceStats = [
  { source: 'Footer', count: 98, pct: 40 },
  { source: 'Checkout', count: 74, pct: 30 },
  { source: 'Popup', count: 62, pct: 25 },
  { source: 'Wholesale', count: 13, pct: 5 },
];

export default function AdminNewsletterPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = mockSubscribers.filter((s) => {
    const matchSearch =
      search === '' ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.firstName?.toLowerCase() || '').includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? s.active : !s.active);
    const matchSource = sourceFilter === 'all' || s.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const activeCount = mockSubscribers.filter((s) => s.active).length;
  const unsubCount = mockSubscribers.filter((s) => !s.active).length;
  const growthRate = '+12%';

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Newsletter</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{mockSubscribers.length} subscribers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6] transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Subscribers',
            value: mockSubscribers.length,
            icon: Mail,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Active',
            value: activeCount,
            icon: UserPlus,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Unsubscribed',
            value: unsubCount,
            icon: UserMinus,
            color: 'text-red-500',
            bg: 'bg-red-50',
          },
          {
            label: 'Growth Rate',
            value: growthRate,
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-1">Subscriber Growth</h3>
          <p className="text-xs text-[#6B7280] mb-4">Cumulative subscribers over time</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="subscribers"
                stroke="#111827"
                strokeWidth={2}
                fill="url(#subGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-1">Acquisition Sources</h3>
          <p className="text-xs text-[#6B7280] mb-4">Where subscribers come from</p>
          <div className="space-y-3">
            {sourceStats.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#374151]">{s.source}</span>
                  <span className="text-xs font-semibold text-[#111827]">
                    {s.count} <span className="text-[#9CA3AF] font-normal">({s.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#111827] rounded-full"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search subscribers..."
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
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">All Sources</option>
          <option value="footer">Footer</option>
          <option value="checkout">Checkout</option>
          <option value="popup">Popup</option>
          <option value="wholesale">Wholesale</option>
        </select>
        {selected.length > 0 && (
          <button className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50">
            Delete {selected.length} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((s) => s.id) : [])}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Country
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Subscribed
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.includes(sub.id)}
                      onChange={() =>
                        setSelected((prev) =>
                          prev.includes(sub.id)
                            ? prev.filter((x) => x !== sub.id)
                            : [...prev, sub.id],
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#111827]">{sub.email}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-[#374151]">
                    {sub.firstName || '–'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${sourceColors[sub.source]}`}
                    >
                      {sub.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${sub.active ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${sub.active ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`}
                      />
                      {sub.active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                    {sub.country}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                    {new Date(sub.subscribedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Mail className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No subscribers found</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {filtered.length} of {mockSubscribers.length} subscribers
          </p>
        </div>
      </div>
    </div>
  );
}
