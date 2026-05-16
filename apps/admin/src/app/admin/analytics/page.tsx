'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  revenueData,
  cartAbandonmentData,
  paymentMethodData,
  topCountriesData,
} from '../../../MOCK_DATAS/mockData';

const tabs = [
  'Revenue',
  'Products',
  'Customers',
  'Wholesale',
  'Payments',
  'Cart Abandonment',
] as const;
type Tab = (typeof tabs)[number];

const weeklyRevenue = [
  { week: 'W1 May', revenue: 780, orders: 10 },
  { week: 'W2 May', revenue: 1240, orders: 16 },
  { week: 'W3 May', revenue: 980, orders: 13 },
  { week: 'W4 May', revenue: 540, orders: 7 },
];

const productSales = [
  { name: 'Crystal Aurora', sales: 287, revenue: 10906 },
  { name: 'Pearl Blanc', sales: 321, revenue: 9309 },
  { name: 'Midnight Velvet', sales: 194, revenue: 6790 },
  { name: 'Rose Quartz', sales: 156, revenue: 6552 },
  { name: 'Champagne Glow', sales: 134, revenue: 5092 },
  { name: 'Silver Frost', sales: 112, revenue: 4032 },
  { name: 'Onyx Noir XL', sales: 98, revenue: 4704 },
];

const customerRetention = [
  { month: 'Nov', newCustomers: 28, returning: 10 },
  { month: 'Dec', newCustomers: 45, returning: 22 },
  { month: 'Jan', newCustomers: 32, returning: 12 },
  { month: 'Feb', newCustomers: 38, returning: 14 },
  { month: 'Mar', newCustomers: 44, returning: 17 },
  { month: 'Apr', newCustomers: 52, returning: 19 },
  { month: 'May', newCustomers: 34, returning: 8 },
];

const wholesaleGrowth = [
  { month: 'Nov 25', accounts: 2, revenue: 680 },
  { month: 'Dec 25', accounts: 2, revenue: 1200 },
  { month: 'Jan 26', accounts: 3, revenue: 840 },
  { month: 'Feb 26', accounts: 3, revenue: 960 },
  { month: 'Mar 26', accounts: 3, revenue: 1120 },
  { month: 'Apr 26', accounts: 3, revenue: 1380 },
  { month: 'May 26', accounts: 5, revenue: 780 },
];

const paymentSuccess = [
  { month: 'Nov 25', success: 95, failed: 5 },
  { month: 'Dec 25', success: 97, failed: 3 },
  { month: 'Jan 26', success: 94, failed: 6 },
  { month: 'Feb 26', success: 98, failed: 2 },
  { month: 'Mar 26', success: 96, failed: 4 },
  { month: 'Apr 26', success: 97, failed: 3 },
  { month: 'May 26', success: 96, failed: 4 },
];

const COLORS = ['#111827', '#635BFF', '#22C55E', '#F59E0B', '#EF4444'];

function MetricCard({
  label,
  value,
  change,
  up,
}: {
  label: string;
  value: string;
  change: string;
  up: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
      <p className="text-xs text-[#6B7280] mb-1">{label}</p>
      <p className="text-xl font-bold text-[#111827]">{value}</p>
      <p
        className={`text-xs mt-1 flex items-center gap-1 font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}
      >
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change} vs last period
      </p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Revenue');
  const [range, setRange] = useState<'7d' | '30d' | '6m' | '1y'>('6m');

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Performance insights across all channels</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-lg p-1">
          {(['7d', '30d', '6m', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === r ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:text-[#111827]'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 bg-white border border-[#E5E7EB] rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === 'Revenue' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Total Revenue" value="€28,100" change="+18.4%" up={true} />
            <MetricCard label="Avg. Order Value" value="€74.93" change="+5.2%" up={true} />
            <MetricCard label="Net Revenue" value="€22,480" change="+20.1%" up={true} />
            <MetricCard label="Refund Rate" value="2.1%" change="-0.4%" up={true} />
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
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
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`€${v.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={2.5}
                  fill="url(#a1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">
                Weekly Revenue (This Month)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyRevenue} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `€${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">Revenue by Country</h3>
              <div className="space-y-3">
                {topCountriesData.map((c, i) => (
                  <div key={c.country}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#374151]">{c.country}</span>
                      <span className="text-xs font-semibold text-[#111827]">
                        €{c.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.revenue / topCountriesData[0].revenue) * 100}%`,
                          background: COLORS[i],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'Products' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Total Units Sold" value="1,325" change="+22.3%" up={true} />
            <MetricCard label="Top Product" value="Pearl Blanc" change="+321 units" up={true} />
            <MetricCard label="Avg. Product Revenue" value="€6,674" change="+14.2%" up={true} />
            <MetricCard label="Out of Stock" value="1" change="+1" up={false} />
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Product Sales Performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productSales} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sales" fill="#111827" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Customers Tab */}
      {activeTab === 'Customers' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Total Customers" value="284" change="+31 this month" up={true} />
            <MetricCard label="Returning Rate" value="28.4%" change="+3.2%" up={true} />
            <MetricCard label="Avg. LTV" value="€98.95" change="+8.7%" up={true} />
            <MetricCard label="Churn Rate" value="4.2%" change="-1.1%" up={true} />
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">
              New vs Returning Customers
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={customerRetention} barSize={20}>
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
                <Bar dataKey="newCustomers" name="New" fill="#111827" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returning" name="Returning" fill="#635BFF" radius={[4, 4, 0, 0]} />
                <Legend iconType="circle" iconSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Wholesale Tab */}
      {activeTab === 'Wholesale' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Wholesale Revenue" value="€6,960" change="+24.3%" up={true} />
            <MetricCard label="Active Accounts" value="3" change="+2 this quarter" up={true} />
            <MetricCard label="Avg. Order Value" value="€312" change="+18.5%" up={true} />
            <MetricCard label="Pending Enquiries" value="2" change="+2 this week" up={false} />
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Wholesale Revenue Growth</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={wholesaleGrowth}>
                <defs>
                  <linearGradient id="wsG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#635BFF" stopOpacity={0.15} />
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
                  tickFormatter={(v) => `€${v}`}
                />
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
                  dataKey="revenue"
                  stroke="#635BFF"
                  strokeWidth={2.5}
                  fill="url(#wsG)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Payments Tab */}
      {activeTab === 'Payments' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Success Rate" value="96.2%" change="+1.3%" up={true} />
            <MetricCard label="Failed Payments" value="2" change="-3 vs last month" up={true} />
            <MetricCard label="Avg. Transaction" value="€74.93" change="+5.1%" up={true} />
            <MetricCard label="Refund Rate" value="2.1%" change="-0.4%" up={true} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">Payment Success Rate</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={paymentSuccess}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[85, 100]}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#22C55E"
                    strokeWidth={2.5}
                    dot={false}
                    name="Success %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">
                Payment Methods Distribution
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {paymentMethodData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} />
                  <Tooltip
                    formatter={(v: number) => `${v}%`}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Cart Abandonment Tab */}
      {activeTab === 'Cart Abandonment' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Abandonment Rate" value="79.2%" change="-2.3%" up={true} />
            <MetricCard label="Recovered Revenue" value="€1,240" change="+34.1%" up={true} />
            <MetricCard label="Abandoned Carts" value="271" change="-18" up={true} />
            <MetricCard label="Recovery Rate" value="20.8%" change="+2.3%" up={true} />
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Checkout Funnel</h3>
            <div className="space-y-4 max-w-lg">
              {cartAbandonmentData.map((item, i) => {
                const pct = Math.round((item.count / cartAbandonmentData[0].count) * 100);
                const dropPct =
                  i > 0
                    ? Math.round(
                        ((cartAbandonmentData[i - 1].count - item.count) /
                          cartAbandonmentData[i - 1].count) *
                          100,
                      )
                    : 0;
                return (
                  <div key={item.step}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === cartAbandonmentData.length - 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-[#F3F4F6] text-[#374151]'}`}
                        >
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-[#111827]">{item.step}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#111827]">{item.count}</span>
                        {i > 0 && <span className="text-xs text-red-500 ml-2">-{dropPct}%</span>}
                      </div>
                    </div>
                    <div className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background:
                            i === cartAbandonmentData.length - 1
                              ? '#22C55E'
                              : `hsl(${220 - i * 25}, 70%, ${50 + i * 3}%)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
