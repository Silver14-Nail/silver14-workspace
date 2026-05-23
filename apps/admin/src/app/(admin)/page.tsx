'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Users,
  AlertTriangle,
  RotateCcw,
  Euro,
  ArrowRight,
  ExternalLink,
  Package,
  Building2,
} from 'lucide-react';
import {
  mockOrders,
  mockProducts,
  revenueData,
  dailyOrdersData,
  cartAbandonmentData,
  paymentMethodData,
  mockWholesale,
} from '../../MOCK_DATAS/mockData';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-rose-50 text-rose-700 border-rose-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  partially_refunded: 'bg-orange-50 text-orange-700 border-orange-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation('dashboard');
  const [revenueRange, setRevenueRange] = useState<'7d' | '30d' | '6m'>('6m');

  const kpis = [
    {
      label: t('kpi.revenue'),
      value: '$28,100',
      change: '+18.4%',
      up: true,
      icon: Euro,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: t('kpi.orders'),
      value: '375',
      change: '+12.1%',
      up: true,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t('kpi.pendingOrders'),
      value: '7',
      change: '-3',
      up: false,
      icon: RotateCcw,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: t('kpi.wholesaleRevenue'),
      value: '$6,960',
      change: '+24.3%',
      up: true,
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: t('kpi.conversionRate'),
      value: '3.2%',
      change: '+0.4%',
      up: true,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: t('kpi.activeCustomers'),
      value: '284',
      change: '+31',
      up: true,
      icon: Users,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: t('kpi.lowStock'),
      value: '3',
      change: t('kpi.actionNeeded'),
      up: false,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: t('kpi.failedPayments'),
      value: '2',
      change: t('kpi.minusOneWeek'),
      up: true,
      icon: CreditCard,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const recentOrders = mockOrders.slice(0, 6);
  const lowStockProducts = mockProducts.filter((p) => p.stock < 20);
  const topProducts = [...mockProducts].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const pendingWholesale = mockWholesale.filter(
    (w) => w.status === 'pending' || w.status === 'reviewing',
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">{t('title')}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {t('welcome', { name: 'Admin' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Live · May 16, 2026
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span
                className={`text-xs flex items-center gap-1 font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-xl font-bold text-[#111827]">{kpi.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111827]">{t('charts.revenueOrders')}</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{t('charts.revenueOrdersSubtitle')}</p>
            </div>
            <div className="flex gap-1">
              {(['7d', '30d', '6m'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRevenueRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${revenueRange === r ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="wsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#635BFF" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#635BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'revenue' ? t('charts.revenueLabel') : t('charts.wholesaleLabel'),
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#111827"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
              <Area
                type="monotone"
                dataKey="wholesale"
                stroke="#635BFF"
                strokeWidth={2}
                fill="url(#wsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-1">{t('charts.paymentMethods')}</h3>
          <p className="text-xs text-[#6B7280] mb-4">{t('charts.paymentMethodsSubtitle')}</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {paymentMethodData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-[#374151]">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-[#111827]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Orders */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-1">{t('charts.dailyOrders')}</h3>
          <p className="text-xs text-[#6B7280] mb-4">{t('charts.dailyOrdersSubtitle')}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyOrdersData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="day"
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
              <Bar dataKey="orders" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cart Abandonment Funnel */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-1">{t('charts.funnel')}</h3>
          <p className="text-xs text-[#6B7280] mb-4">{t('charts.funnelSubtitle')}</p>
          <div className="space-y-3 mt-2">
            {cartAbandonmentData.map((item, i) => {
              const pct = Math.round((item.count / cartAbandonmentData[0].count) * 100);
              return (
                <div key={item.step}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#374151] font-medium">{item.step}</span>
                    <span className="text-xs text-[#6B7280]">
                      {item.count} <span className="text-[#9CA3AF]">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background:
                          i === cartAbandonmentData.length - 1
                            ? '#22C55E'
                            : `hsl(${220 - i * 30}, 70%, 50%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">{t('recentOrders.title')}</h3>
            <Link
              href="/admin/orders"
              className="text-xs text-[#635BFF] hover:underline flex items-center gap-1"
            >
              {t('recentOrders.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#374151]">
                    {order.customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#111827]">{order.orderNumber}</p>
                    <p className="text-xs text-[#6B7280]">{order.customer.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.orderStatus} />
                  <span className="text-xs font-semibold text-[#111827]">
                    ${order.total.toFixed(2)}
                  </span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-[#9CA3AF] hover:text-[#111827]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">{t('topProducts.title')}</h3>
            <Link
              href="/admin/products"
              className="text-xs text-[#635BFF] hover:underline flex items-center gap-1"
            >
              {t('topProducts.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {topProducts.map((product, i) => (
              <div
                key={product.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#9CA3AF]">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#111827]">{product.name}</p>
                    <p className="text-xs text-[#6B7280]">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#111827]">{product.sales} {t('topProducts.sold')}</p>
                  <p className="text-xs text-[#6B7280]">${product.basePrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              {t('lowStockAlerts.title')}
            </h3>
            <Link
              href="/admin/inventory"
              className="text-xs text-[#635BFF] hover:underline flex items-center gap-1"
            >
              {t('lowStockAlerts.manage')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#111827]">{product.name}</p>
                  <p className="text-xs text-[#6B7280]">{product.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock < 10 ? 'bg-orange-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}
                  >
                    {t('lowStockAlerts.left', { count: product.stock })}
                  </span>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">
                {t('lowStockAlerts.allInStock')}
              </div>
            )}
          </div>
        </div>

        {/* Wholesale Enquiries */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">{t('wholesale.title')}</h3>
            <Link
              href="/admin/wholesale"
              className="text-xs text-[#635BFF] hover:underline flex items-center gap-1"
            >
              {t('wholesale.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {pendingWholesale.map((account) => (
              <div
                key={account.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-[#F9FAFB]"
              >
                <div>
                  <p className="text-xs font-medium text-[#111827]">{account.businessName}</p>
                  <p className="text-xs text-[#6B7280]">
                    {account.contactName} · {account.country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={account.status} />
                  <span className="text-xs text-[#9CA3AF]">
                    {new Date(account.appliedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {pendingWholesale.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">
                {t('wholesale.noPending')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
