'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingBag, CreditCard, Users, AlertTriangle,
  RotateCcw, Euro, ArrowRight, ExternalLink, Building2, RefreshCw,
} from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  contactSnapshot?: { fullName?: string; email?: string } | null;
}

interface Enquiry {
  id: string;
  businessName: string;
  contactName: string;
  country: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-gray-100 text-gray-600 border-gray-200',
  refunded:   'bg-rose-50 text-rose-700 border-rose-200',
  under_review: 'bg-amber-50 text-amber-700 border-amber-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation('dashboard');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingEnquiries, setPendingEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setRecentOrders(json.recentOrders ?? []);
      setPendingEnquiries(json.pendingEnquiries ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpis = [
    { label: t('kpi.revenue'),          value: '—', change: '—',  up: true,  icon: Euro,          color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('kpi.orders'),           value: recentOrders.length > 0 ? `${recentOrders.length}+` : '0', change: '—', up: true, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('kpi.pendingOrders'),    value: String(recentOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length), change: '—', up: false, icon: RotateCcw, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('kpi.wholesaleRevenue'), value: '—', change: '—',  up: true,  icon: Building2,      color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('kpi.conversionRate'),   value: '—', change: '—',  up: true,  icon: TrendingUp,     color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t('kpi.activeCustomers'),  value: '—', change: '—',  up: true,  icon: Users,          color: 'text-cyan-600',   bg: 'bg-cyan-50'   },
    { label: t('kpi.lowStock'),         value: '—', change: t('kpi.actionNeeded'), up: false, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t('kpi.failedPayments'),   value: '—', change: '—',  up: true,  icon: CreditCard,     color: 'text-red-600',    bg: 'bg-red-50'    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">{t('title')}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t('welcome', { name: 'Admin' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors">
            <RefreshCw className="w-4 h-4 text-[#6B7280]" />
          </button>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Live
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span className={`text-xs flex items-center gap-1 font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-xl font-bold text-[#111827]">{loading ? '…' : kpi.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart placeholder */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#111827] mb-1">{t('charts.revenueOrders')}</h3>
        <p className="text-xs text-[#6B7280] mb-4">{t('charts.revenueOrdersSubtitle')}</p>
        {recentOrders.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={recentOrders.map(o => ({ date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), total: Number(o.total) }))}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#111827" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-[#9CA3AF] border border-dashed border-[#E5E7EB] rounded-lg">
            No order data yet
          </div>
        )}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">{t('recentOrders.title')}</h3>
            <Link href="/admin/orders" className="text-xs text-[#635BFF] hover:underline flex items-center gap-1">
              {t('recentOrders.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200" />
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#374151]">
                      {(order.contactSnapshot?.fullName ?? 'G').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#111827]">{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-[#6B7280]">{order.contactSnapshot?.fullName ?? 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-semibold text-[#111827]">
                      {order.currency} {Number(order.total).toFixed(2)}
                    </span>
                    <Link href={`/admin/orders/${order.id}`} className="text-[#9CA3AF] hover:text-[#111827]">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-[#9CA3AF]">No orders yet</div>
            )}
          </div>
        </div>

        {/* Pending Wholesale Enquiries */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">{t('wholesale.title')}</h3>
            <Link href="/admin/wholesales" className="text-xs text-[#635BFF] hover:underline flex items-center gap-1">
              {t('wholesale.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
              ))
            ) : pendingEnquiries.length > 0 ? (
              pendingEnquiries.map((e) => (
                <div key={e.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#F9FAFB]">
                  <div>
                    <p className="text-xs font-medium text-[#111827]">{e.businessName}</p>
                    <p className="text-xs text-[#6B7280]">{e.contactName} · {e.country}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={e.status} />
                    <span className="text-xs text-[#9CA3AF]">
                      {new Date(e.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-[#9CA3AF]">{t('wholesale.noPending')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
