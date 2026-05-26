'use client';

import { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Plus, Edit, Search } from 'lucide-react';
import { mockProducts } from '../../../../MOCK_DATAS/mockData';

const stockMovements = [
  {
    product: 'Crystal Aurora Set',
    type: 'sale',
    qty: -3,
    date: '2026-05-16T09:30:00Z',
    ref: 'LUN-2026-0089',
  },
  {
    product: 'Pearl Blanc Collection',
    type: 'sale',
    qty: -2,
    date: '2026-05-15T14:20:00Z',
    ref: 'LUN-2026-0088',
  },
  {
    product: 'Midnight Velvet',
    type: 'restock',
    qty: +50,
    date: '2026-05-15T10:00:00Z',
    ref: 'PO-2026-012',
  },
  {
    product: 'Rose Quartz Luxe',
    type: 'sale',
    qty: -1,
    date: '2026-05-14T16:00:00Z',
    ref: 'LUN-2026-0087',
  },
  {
    product: 'Champagne Glow',
    type: 'adjustment',
    qty: -2,
    date: '2026-05-13T11:00:00Z',
    ref: 'ADJ-001',
  },
  {
    product: 'Crystal Aurora Set',
    type: 'sale',
    qty: -1,
    date: '2026-05-12T09:00:00Z',
    ref: 'LUN-2026-0086',
  },
];

export default function AdminInventoryPage() {
  const [search, setSearch] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);

  const filtered = mockProducts.filter((p) => {
    const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
    const matchLow = !showLowOnly || p.stock < 20;
    return matchSearch && matchLow;
  });

  const lowStockCount = mockProducts.filter((p) => p.stock < 20).length;
  const outOfStockCount = mockProducts.filter((p) => p.stock === 0).length;
  const totalUnits = mockProducts.reduce((s, p) => s + p.stock, 0);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Inventory</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Track and manage product stock levels</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
          <Plus className="w-4 h-4" /> Restock Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Units',
            value: totalUnits,
            icon: Package,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Low Stock (<20)',
            value: lowStockCount,
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Out of Stock',
            value: outOfStockCount,
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
          {
            label: 'SKUs Tracked',
            value: mockProducts.length,
            icon: Package,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
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

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{lowStockCount} products</span> are running low on
            stock. Consider restocking soon.
          </p>
          <button
            onClick={() => setShowLowOnly(true)}
            className="ml-auto text-xs font-medium text-amber-700 underline hover:no-underline"
          >
            View all
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <button
          onClick={() => setShowLowOnly(!showLowOnly)}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors border ${showLowOnly ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]'}`}
        >
          {showLowOnly ? '✓ Low Stock Only' : 'Low Stock Only'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Product', 'SKU', 'Stock', 'Status', 'Last Updated', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filtered.map((product) => {
                  const status =
                    product.stock === 0
                      ? 'out'
                      : product.stock < 10
                        ? 'critical'
                        : product.stock < 20
                          ? 'low'
                          : 'ok';
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${status === 'out' ? 'bg-red-50/30' : status === 'critical' ? 'bg-orange-50/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#9CA3AF]" />
                          </div>
                          <p className="text-xs font-medium text-[#111827]">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#6B7280]">{product.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${status === 'out' ? 'bg-red-500' : status === 'critical' ? 'bg-orange-500' : status === 'low' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${Math.min(100, (product.stock / 200) * 100)}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold ${status === 'out' ? 'text-red-600' : status === 'critical' ? 'text-orange-600' : status === 'low' ? 'text-amber-600' : 'text-[#374151]'}`}
                          >
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            status === 'out'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : status === 'critical'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : status === 'low'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {status === 'out'
                            ? 'Out of Stock'
                            : status === 'critical'
                              ? 'Critical'
                              : status === 'low'
                                ? 'Low Stock'
                                : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9CA3AF]">
                        {new Date(product.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-[#F3F4F6] hover:border-[#111827] transition-colors">
                          <Edit className="w-3 h-3" /> Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movement History */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">Movement History</h3>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {stockMovements.map((m, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#111827] leading-tight">{m.product}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{m.ref}</p>
                  </div>
                  <span
                    className={`text-xs font-bold ml-2 ${m.qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {m.qty > 0 ? '+' : ''}
                    {m.qty}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded border ${
                      m.type === 'sale'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : m.type === 'restock'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {m.type}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">
                    {new Date(m.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
