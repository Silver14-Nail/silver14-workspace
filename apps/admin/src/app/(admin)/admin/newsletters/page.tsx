'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Trash2, Mail, TrendingUp, UserMinus, UserPlus, RefreshCw } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  source: 'footer' | 'checkout' | 'popup' | 'wholesale_page';
  createdAt: string;
  unsubscribedAt: string | null;
}

const sourceColors: Record<string, string> = {
  footer: 'bg-blue-50 text-blue-700 border-blue-200',
  checkout: 'bg-purple-50 text-purple-700 border-purple-200',
  popup: 'bg-amber-50 text-amber-700 border-amber-200',
  wholesale_page: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const sourceLabel: Record<string, string> = {
  footer: 'Footer',
  checkout: 'Checkout',
  popup: 'Popup',
  wholesale_page: 'Wholesale',
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setSubscribers(json.items ?? []);
    } catch (e) {
      console.error('Failed to load subscribers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleUnsubscribe = async (id: string) => {
    const prev = subscribers.find((s) => s.id === id);
    setSubscribers((subs) => subs.map((s) => (s.id === id ? { ...s, status: 'unsubscribed' as const } : s)));
    try {
      const res = await fetch(`/api/newsletter/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unsubscribed' }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
    } catch (e) {
      console.error('Failed to unsubscribe:', e);
      // Rollback optimistic update
      if (prev) setSubscribers((subs) => subs.map((s) => (s.id === id ? prev : s)));
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Email', 'Status', 'Source', 'Subscribed At'],
      ...subscribers.map((s) => [
        s.email,
        s.status,
        sourceLabel[s.source] ?? s.source,
        new Date(s.createdAt).toLocaleDateString('en-GB'),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter((s) => {
    const matchSearch =
      search === '' || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? s.status === 'active' : s.status === 'unsubscribed');
    const matchSource = sourceFilter === 'all' || s.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const activeCount = subscribers.filter((s) => s.status === 'active').length;
  const unsubCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  // Build monthly growth from real data — key as YYYY-MM for reliable ISO sorting
  const growthData = (() => {
    const counts: Record<string, { label: string; count: number }> = {};
    subscribers
      .filter((s) => s.status === 'active')
      .forEach((s) => {
        const d = new Date(s.createdAt);
        const isoKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!counts[isoKey]) counts[isoKey] = { label, count: 0 };
        counts[isoKey].count += 1;
      });
    let running = 0;
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, { label, count }]) => {
        running += count;
        return { month: label, subscribers: running };
      });
  })();

  // Source breakdown from real data
  const sourceStats = (['footer', 'checkout', 'popup', 'wholesale_page'] as const).map(
    (src) => {
      const count = subscribers.filter((s) => s.source === src).length;
      const pct = subscribers.length > 0 ? Math.round((count / subscribers.length) * 100) : 0;
      return { source: sourceLabel[src], count, pct };
    },
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Newsletter</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {loading ? 'Loading...' : `${subscribers.length} subscribers`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSubscribers}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm hover:bg-[#F3F4F6] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6] transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Subscribers', value: subscribers.length, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: activeCount, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Unsubscribed', value: unsubCount, icon: UserMinus, color: 'text-red-500', bg: 'bg-red-50' },
          {
            label: 'Growth Rate',
            value: subscribers.length > 0 ? `+${activeCount}` : '—',
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-1">Subscriber Growth</h3>
          <p className="text-xs text-[#6B7280] mb-4">Cumulative active subscribers over time</p>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="subscribers" stroke="#111827" strokeWidth={2} fill="url(#subGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#9CA3AF]">
              No data yet
            </div>
          )}
        </div>

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
                  <div className="h-full bg-[#111827] rounded-full" style={{ width: `${s.pct}%` }} />
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
            placeholder="Search by email..."
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
          <option value="wholesale_page">Wholesale</option>
        </select>
        {selected.length > 0 && (
          <button className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50">
            Unsubscribe {selected.length} selected
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">Subscribed</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selected.includes(sub.id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(sub.id) ? prev.filter((x) => x !== sub.id) : [...prev, sub.id],
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111827]">{sub.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${sourceColors[sub.source] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {sourceLabel[sub.source] ?? sub.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${sub.status === 'active' ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-400' : 'bg-[#D1D5DB]'}`} />
                        {sub.status === 'active' ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                      {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleUnsubscribe(sub.id)}
                          title="Unsubscribe"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Mail className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No subscribers found</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {filtered.length} of {subscribers.length} subscribers
          </p>
        </div>
      </div>
    </div>
  );
}
