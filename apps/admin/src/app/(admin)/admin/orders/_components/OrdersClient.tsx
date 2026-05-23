'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Eye, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type {
  OrderListResponse,
  OrderListItem,
  OrderStats,
  OrderStatus,
  PaymentStatus,
  OrderListQuery,
} from '../types';
import { listOrdersAction } from '../actions';
import { OrderDrawer } from './OrderDrawer';

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-rose-50 text-rose-700 border-rose-200',
  partially_refunded: 'bg-orange-50 text-orange-700 border-orange-200',
};

function StatusBadge({ status, type }: { status: string; type: 'order' | 'payment' }) {
  const colorMap = type === 'order' ? ORDER_STATUS_COLORS : PAYMENT_STATUS_COLORS;
  const color =
    (colorMap as Record<string, string>)[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] px-5 py-4">
      <p className="text-xs text-[#6B7280] font-medium">{label}</p>
      <p className="text-xl font-semibold text-[#111827] mt-1">{value}</p>
      {sub && <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>}
    </div>
  );
}

interface OrdersClientProps {
  initialOrders: OrderListResponse;
  initialStats: OrderStats | null;
  currentQuery: OrderListQuery;
}

export function OrdersClient({ initialOrders, initialStats, currentQuery }: OrdersClientProps) {
  const { t } = useTranslation('orders');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [orders, setOrders] = useState<OrderListResponse>(initialOrders);
  const [stats] = useState<OrderStats | null>(initialStats);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [search, setSearch] = useState(currentQuery.search ?? '');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(
    (currentQuery.status as OrderStatus) ?? 'all',
  );
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>(
    (currentQuery.paymentStatus as PaymentStatus) ?? 'all',
  );
  const [dateFrom, setDateFrom] = useState(currentQuery.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(currentQuery.dateTo ?? '');

  const buildQuery = useCallback(
    (overrides: Partial<OrderListQuery> = {}): OrderListQuery => ({
      ...currentQuery,
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      ...overrides,
    }),
    [currentQuery, search, statusFilter, paymentFilter, dateFrom, dateTo],
  );

  const pushUrl = (query: OrderListQuery) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.page && query.page > 1) params.set('page', String(query.page));
    else params.delete('page');
    if (query.search) params.set('search', query.search);
    else params.delete('search');
    if (query.status) params.set('status', query.status);
    else params.delete('status');
    if (query.paymentStatus) params.set('paymentStatus', query.paymentStatus);
    else params.delete('paymentStatus');
    if (query.dateFrom) params.set('dateFrom', query.dateFrom);
    else params.delete('dateFrom');
    if (query.dateTo) params.set('dateTo', query.dateTo);
    else params.delete('dateTo');
    if (query.sortBy && query.sortBy !== 'createdAt') params.set('sortBy', query.sortBy);
    else params.delete('sortBy');
    if (query.sortOrder && query.sortOrder !== 'DESC') params.set('sortOrder', query.sortOrder);
    else params.delete('sortOrder');
    router.push(`/admin/orders?${params.toString()}`);
  };

  const applyFilters = (query: OrderListQuery) => {
    startTransition(async () => {
      const result = await listOrdersAction({ ...query, page: 1 });
      if (result.success) setOrders(result.data);
      pushUrl({ ...query, page: 1 });
    });
  };

  const goToPage = (page: number) => {
    const query = buildQuery({ page });
    startTransition(async () => {
      const result = await listOrdersAction(query);
      if (result.success) setOrders(result.data);
      pushUrl(query);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(buildQuery());
  };

  const handleStatusFilter = (status: OrderStatus | 'all') => {
    setStatusFilter(status);
    applyFilters(buildQuery({ status: status !== 'all' ? status : undefined }));
  };

  const handlePaymentFilter = (value: string) => {
    const pStatus = value as PaymentStatus | 'all';
    setPaymentFilter(pStatus);
    applyFilters(buildQuery({ paymentStatus: pStatus !== 'all' ? pStatus : undefined }));
  };

  const handleDateFilter = () => {
    applyFilters(buildQuery({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }));
  };

  const handleSort = (field: OrderListQuery['sortBy']) => {
    const currentSortBy = currentQuery.sortBy ?? 'createdAt';
    const currentSortOrder = currentQuery.sortOrder ?? 'DESC';
    const newOrder = currentSortBy === field && currentSortOrder === 'DESC' ? 'ASC' : 'DESC';
    applyFilters(buildQuery({ sortBy: field, sortOrder: newOrder }));
  };

  const handleDrawerClose = (refreshed?: OrderListResponse) => {
    setSelectedId(null);
    if (refreshed) setOrders(refreshed);
  };

  const { pagination } = orders;
  const quickStatuses: Array<{ key: OrderStatus | 'all'; label: string }> = [
    { key: 'all', label: t('status.all') },
    { key: 'pending', label: t('status.pending') },
    { key: 'processing', label: t('status.processing') },
    { key: 'shipped', label: t('status.shipped') },
    { key: 'delivered', label: t('status.delivered') },
    { key: 'cancelled', label: t('status.cancelled') },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">{t('title')}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {t('subtitle', { count: pagination.totalItems })}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6]">
          <Download className="w-4 h-4" /> {t('export')}
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard
            label={t('stats.revenue')}
            value={`$${stats.revenue.thisMonth.toFixed(2)}`}
            sub={t('stats.revenueToday', { amount: `$${stats.revenue.today.toFixed(2)}` })}
          />
          <StatCard label={t('stats.pending')} value={stats.counts.pending} />
          <StatCard label={t('stats.shipped')} value={stats.counts.shipped} />
          <StatCard label={t('stats.delivered')} value={stats.counts.delivered} />
        </div>
      )}

      {/* Quick status filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {quickStatuses.map(({ key, label }) => {
          const count =
            key === 'all' ? stats?.counts.total : stats?.counts[key as keyof typeof stats.counts];
          return (
            <button
              key={key}
              onClick={() => handleStatusFilter(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-[#111827] text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]'
              }`}
            >
              {label}
              {count !== undefined && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3">
        <form
          onSubmit={handleSearch}
          className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg"
        >
          <Search className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
          <input
            type="text"
            placeholder={t('filter.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </form>

        <select
          value={paymentFilter}
          onChange={(e) => handlePaymentFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">{t('filter.allPayments')}</option>
          <option value="paid">{t('filter.paid')}</option>
          <option value="pending">{t('filter.paymentPending')}</option>
          <option value="failed">{t('filter.failed')}</option>
          <option value="refunded">{t('filter.refunded')}</option>
          <option value="partially_refunded">{t('filter.partialRefund')}</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none"
          />
          <span className="text-xs text-[#9CA3AF]">{t('filter.dateTo')}</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none"
          />
          <button
            onClick={handleDateFilter}
            className="px-3 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium"
          >
            {t('filter.apply')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className={`bg-white rounded-xl border border-[#E5E7EB] overflow-hidden transition-opacity ${isPending ? 'opacity-60' : ''}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  {t('table.order')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  {t('table.customer')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  {t('table.payment')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  {t('table.shipping')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider cursor-pointer hover:text-[#111827] select-none"
                  onClick={() => handleSort('total')}
                >
                  <span className="flex items-center gap-1">
                    {t('table.total')} <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-[#111827] select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  <span className="flex items-center gap-1">
                    {t('table.date')} <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  {t('table.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {orders.items.map((order) => (
                <OrderRow key={order.id} order={order} onView={() => setSelectedId(order.id)} />
              ))}
            </tbody>
          </table>
        </div>

        {orders.items.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#9CA3AF]">
              {isPending ? t('loading') : t('empty')}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
            <p className="text-xs text-[#6B7280]">
              {t('pagination', {
                page: pagination.currentPage,
                totalPages: pagination.totalPages,
                total: pagination.totalItems,
              })}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.currentPage <= 1 || isPending}
                onClick={() => goToPage(pagination.currentPage - 1)}
                className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    disabled={isPending}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                      p === pagination.currentPage
                        ? 'bg-[#111827] text-white'
                        : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={pagination.currentPage >= pagination.totalPages || isPending}
                onClick={() => goToPage(pagination.currentPage + 1)}
                className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {selectedId && (
        <OrderDrawer
          orderId={selectedId}
          onClose={handleDrawerClose}
          onRefresh={(data) => setOrders(data)}
          currentQuery={buildQuery()}
        />
      )}
    </div>
  );
}

function OrderRow({ order, onView }: { order: OrderListItem; onView: () => void }) {
  const customer = order.user
    ? { name: order.user.fullName, email: order.user.email }
    : { name: order.contactSnapshot.fullName, email: order.contactSnapshot.email };

  const country = order.shippingSnapshot.country;
  const paymentStatus = order.payment?.status;

  return (
    <tr className="hover:bg-[#F9FAFB] transition-colors">
      <td className="px-4 py-3">
        <p className="text-xs font-mono font-semibold text-[#111827]">
          {order.id.slice(0, 8).toUpperCase()}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#374151] flex-shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#111827] truncate">{customer.name}</p>
            <p className="text-xs text-[#9CA3AF] truncate">{country}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {paymentStatus ? (
          <StatusBadge status={paymentStatus} type="payment" />
        ) : (
          <span className="text-xs text-[#9CA3AF]">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} type="order" />
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-xs text-[#6B7280]">
        {order.trackingNumber ? (
          <span className="font-mono text-xs text-purple-600">{order.trackingNumber}</span>
        ) : order.carrier ? (
          <span>{order.carrier}</span>
        ) : (
          <span className="text-[#9CA3AF]">{order.shippingSnapshot.shippingMethodName}</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
        {order.currency === 'EUR' ? '€' : order.currency === 'GBP' ? '£' : '$'}
        {Number(order.total).toFixed(2)}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
        {new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onView}
          className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
