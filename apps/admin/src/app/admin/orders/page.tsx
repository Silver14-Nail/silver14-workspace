'use client';

import { useState } from 'react';
import {
  Search,
  Eye,
  X,
  Printer,
  Mail,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import { mockOrders, type AdminOrder } from '../../../MOCK_DATAS/mockData';

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
};

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function OrderDrawer({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [trackingInput, setTrackingInput] = useState(order.trackingNumber || '');
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus);

  const timeline = [
    { status: 'confirmed', label: 'Order Confirmed', date: order.placedAt, done: true },
    {
      status: 'processing',
      label: 'Processing',
      date: '2026-05-11T10:00:00Z',
      done: statusFlow.indexOf(order.orderStatus) >= 2,
    },
    {
      status: 'shipped',
      label: 'Shipped',
      date: order.trackingNumber ? '2026-05-12T08:00:00Z' : null,
      done: statusFlow.indexOf(order.orderStatus) >= 3,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      date: order.orderStatus === 'delivered' ? '2026-05-14T14:00:00Z' : null,
      done: order.orderStatus === 'delivered',
    },
  ];

  const mockItems = [
    { name: 'Crystal Aurora Set', shape: 'Coffin', size: 'M Kit', qty: 1, price: 38.0 },
    { name: 'Pearl Blanc Collection', shape: 'Almond', size: 'S Kit', qty: 1, price: 29.0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">{order.orderNumber}</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {new Date(order.placedAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]">
              <Printer className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]">
              <Mail className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Status Badges */}
          <div className="px-6 py-4 flex gap-2 border-b border-[#E5E7EB]">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
              {order.shippingMethod}
            </span>
          </div>

          {/* Customer */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Customer & Shipping
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {order.customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">{order.customer.name}</p>
                <p className="text-xs text-[#6B7280]">{order.customer.email}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  123 Rue de la Paix, Paris 75001, {order.country}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Items ({order.items})
            </h3>
            <div className="space-y-3">
              {mockItems.slice(0, order.items).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0 text-xs font-medium text-[#9CA3AF]">
                    💅
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#111827]">{item.name}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {item.shape} · {item.size} · Qty: {item.qty}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[#111827]">€{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#F3F4F6] space-y-1">
              <div className="flex justify-between text-xs text-[#6B7280]">
                <span>Subtotal</span>
                <span>€{(order.total - 5.9).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6B7280]">
                <span>Shipping</span>
                <span>€5.90</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#111827] pt-1">
                <span>Total</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Order Timeline
            </h3>
            <div className="space-y-3">
              {timeline.map((step, i) => (
                <div key={step.status} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${step.done ? 'bg-[#111827]' : 'bg-[#F3F4F6] border-2 border-[#E5E7EB]'}`}
                  >
                    {step.done && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-xs font-medium ${step.done ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-[#9CA3AF]">
                        {new Date(step.date).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" /> Tracking
            </h3>
            <div className="flex gap-2">
              <input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter tracking number..."
                className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
              />
              <button className="px-4 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151]">
                Update
              </button>
            </div>
          </div>

          {/* Update Status */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Update Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {statusFlow.map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentStatus(s as typeof currentStatus)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${currentStatus === s ? 'bg-[#111827] text-white border-[#111827]' : 'border-[#E5E7EB] text-[#374151] hover:border-[#111827]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-2">
          <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-sm font-medium hover:bg-[#374151] transition-colors">
            Save Changes
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      search === '' ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const statusCounts = {
    all: mockOrders.length,
    pending: mockOrders.filter((o) => o.orderStatus === 'pending').length,
    processing: mockOrders.filter((o) => o.orderStatus === 'processing').length,
    shipped: mockOrders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: mockOrders.filter((o) => o.orderStatus === 'delivered').length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Orders</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{mockOrders.length} total orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6]">
          <Printer className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Quick filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === status ? 'bg-[#111827] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]'}`}
          >
            {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)} (
            {count})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Shipping
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-[#111827]">{order.orderNumber}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {order.items} item{order.items !== 1 ? 's' : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#374151]">
                        {order.customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#111827]">{order.customer.name}</p>
                        <p className="text-xs text-[#9CA3AF]">{order.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-[#6B7280]">
                    {order.trackingNumber ? (
                      <span className="font-mono text-xs text-purple-600">
                        {order.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF]">{order.shippingMethod}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                    €{order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                    {new Date(order.placedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#9CA3AF]">No orders match your filters</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {filtered.length} of {mockOrders.length} orders
          </p>
          <div className="flex items-center gap-1">
            {[1, 2].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === 1 ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
