'use client';

import { useState } from 'react';
import {
  Search,
  Eye,
  X,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { mockPayments, type AdminPayment } from '../../../../MOCK_DATAS/mockData';

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-rose-50 text-rose-700 border-rose-200',
  partially_refunded: 'bg-orange-50 text-orange-700 border-orange-200',
};

const gatewayColors: Record<string, { bg: string; text: string; icon: string }> = {
  stripe: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: '⚡' },
  paypal: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🅿' },
  braintree: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '🌿' },
};

const cardBrandIcons: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 MC',
  amex: '💳 Amex',
  discover: '💳 Disc',
};

function PaymentDrawer({ payment, onClose }: { payment: AdminPayment; onClose: () => void }) {
  const gw = gatewayColors[payment.gateway];
  const isRefundable = payment.status === 'paid';

  const logs = [
    {
      time: payment.paidAt,
      event: `Payment ${payment.status}`,
      detail: `${payment.gateway.toUpperCase()} — ${payment.currency} ${payment.amount.toFixed(2)}`,
    },
    { time: payment.paidAt, event: 'Webhook received', detail: 'payment_intent.succeeded' },
    {
      time: new Date(new Date(payment.paidAt).getTime() - 5000).toISOString(),
      event: 'Payment intent created',
      detail: payment.transactionId,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">Payment Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Main */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-[#111827]">${payment.amount.toFixed(2)}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{payment.currency}</p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[payment.status]}`}
              >
                {payment.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7280]">Transaction ID</span>
                <span className="font-mono text-[#374151] text-xs truncate max-w-[200px]">
                  {payment.transactionId}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7280]">Date</span>
                <span className="text-[#374151]">
                  {new Date(payment.paidAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7280]">Order</span>
                <span className="text-[#635BFF] font-medium">{payment.orderId}</span>
              </div>
            </div>
          </div>

          {/* Gateway & Card */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Payment Method
            </h3>
            <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span
                className={`w-10 h-10 rounded-lg ${gw.bg} flex items-center justify-center text-lg`}
              >
                {gw.icon}
              </span>
              <div>
                <p className={`text-sm font-semibold ${gw.text} capitalize`}>{payment.gateway}</p>
                {payment.cardBrand && payment.last4 && (
                  <p className="text-xs text-[#6B7280]">
                    {cardBrandIcons[payment.cardBrand] || payment.cardBrand} •••• {payment.last4}
                  </p>
                )}
                {payment.gateway === 'paypal' && (
                  <p className="text-xs text-[#6B7280]">{payment.customer.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Customer
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center text-white text-xs font-semibold">
                {payment.customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">{payment.customer.name}</p>
                <p className="text-xs text-[#6B7280]">{payment.customer.email}</p>
              </div>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Risk Assessment
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: 'Risk Score',
                  value: payment.status === 'failed' ? 'High' : 'Low',
                  ok: payment.status !== 'failed',
                },
                { label: 'CVC Check', value: 'Pass', ok: true },
                { label: 'Address Check', value: 'Pass', ok: true },
                { label: '3D Secure', value: 'Authenticated', ok: true },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-1">
                  <span className="text-xs text-[#6B7280]">{r.label}</span>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${r.ok ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {r.ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Logs */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">
              Transaction Logs
            </h3>
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111827] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[#111827]">{log.event}</p>
                    <p className="text-xs text-[#6B7280] font-mono">{log.detail}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {new Date(log.time).toLocaleString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isRefundable && (
          <div className="px-6 py-4 border-t border-[#E5E7EB]">
            <button className="w-full px-4 py-2.5 rounded-lg border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Issue Refund
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

  const filtered = mockPayments.filter((p) => {
    const matchSearch =
      search === '' ||
      p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchGateway = gatewayFilter === 'all' || p.gateway === gatewayFilter;
    return matchSearch && matchStatus && matchGateway;
  });

  const totalRevenue = mockPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = mockPayments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);
  const failedCount = mockPayments.filter((p) => p.status === 'failed').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Payments</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{mockPayments.length} transactions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Total Collected',
            value: `$${totalRevenue.toFixed(2)}`,
            color: 'text-emerald-600',
          },
          {
            label: 'Total Refunded',
            value: `$${totalRefunded.toFixed(2)}`,
            color: 'text-rose-600',
          },
          { label: 'Failed Payments', value: String(failedCount), color: 'text-red-600' },
          {
            label: 'Success Rate',
            value: `${Math.round((mockPayments.filter((p) => p.status === 'paid').length / mockPayments.length) * 100)}%`,
            color: 'text-emerald-600',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
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
            placeholder="Transaction ID or customer..."
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
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={gatewayFilter}
          onChange={(e) => setGatewayFilter(e.target.value)}
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="all">All Gateways</option>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
          <option value="braintree">Braintree</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((payment) => {
                const gw = gatewayColors[payment.gateway];
                return (
                  <tr key={payment.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-[#374151] truncate max-w-[140px]">
                        {payment.transactionId.slice(0, 20)}…
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-[#111827]">{payment.customer.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{payment.customer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${gw.bg} ${gw.text}`}
                      >
                        {gw.icon}{' '}
                        {payment.gateway.charAt(0).toUpperCase() + payment.gateway.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[payment.status]}`}
                      >
                        {payment.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6B7280]">
                      {payment.cardBrand && payment.last4
                        ? `${payment.cardBrand.toUpperCase()} •••• ${payment.last4}`
                        : payment.gateway === 'paypal'
                          ? 'PayPal Account'
                          : '–'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-[#6B7280]">
                      {new Date(payment.paidAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <CreditCard className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm text-[#9CA3AF]">No payments found</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            Showing {filtered.length} of {mockPayments.length} transactions
          </p>
        </div>
      </div>

      {selectedPayment && (
        <PaymentDrawer payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </div>
  );
}
