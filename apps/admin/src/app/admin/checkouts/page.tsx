'use client';

import { useState } from 'react';
import { ShoppingCart, Eye, Send, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { mockAbandonedCarts } from '../../../MOCK_DATAS/mockData';

const tabsConfig = [
  { id: 'abandoned', label: 'Abandoned Carts', count: 5 },
  { id: 'active', label: 'Active Carts', count: 3 },
  { id: 'sessions', label: 'Checkout Sessions', count: 8 },
  { id: 'guest', label: 'Guest Checkouts', count: 4 },
] as const;

type CartTab = (typeof tabsConfig)[number]['id'];

const activeCarts = [
  {
    id: 'act1',
    customer: 'Amelia Clarke',
    email: 'amelia.clarke@gmail.com',
    items: 2,
    value: 76.0,
    step: 'Payment',
    updatedAt: '2026-05-16T09:50:00Z',
    coupon: 'LUNELLE10',
  },
  {
    id: 'act2',
    customer: 'Guest (frederique@gmail.com)',
    email: 'frederique@gmail.com',
    items: 1,
    value: 38.0,
    step: 'Shipping',
    updatedAt: '2026-05-16T09:45:00Z',
    coupon: null,
  },
  {
    id: 'act3',
    customer: 'Nora Schmidt',
    email: 'nora.schmidt@web.de',
    items: 3,
    value: 113.0,
    step: 'Contact',
    updatedAt: '2026-05-16T09:40:00Z',
    coupon: null,
  },
];

const checkoutSessions = [
  {
    id: 'cs1',
    sessionId: 'cs_live_a1B2C3D4E5',
    customer: 'Sophie Martin',
    step: 'Payment',
    duration: '4m 32s',
    createdAt: '2026-05-16T09:31:00Z',
    status: 'active',
    total: 76.0,
  },
  {
    id: 'cs2',
    sessionId: 'cs_live_f6G7H8I9J0',
    customer: 'Guest',
    step: 'Completed',
    duration: '6m 12s',
    createdAt: '2026-05-16T09:15:00Z',
    status: 'completed',
    total: 38.0,
  },
  {
    id: 'cs3',
    sessionId: 'cs_live_k1L2M3N4O5',
    customer: 'Emma Weber',
    step: 'Shipping',
    duration: '2m 10s',
    createdAt: '2026-05-16T09:00:00Z',
    status: 'active',
    total: 45.0,
  },
  {
    id: 'cs4',
    sessionId: 'cs_live_p6Q7R8S9T0',
    customer: 'Guest',
    step: 'Contact',
    duration: '1m 05s',
    createdAt: '2026-05-16T08:55:00Z',
    status: 'abandoned',
    total: 68.0,
  },
  {
    id: 'cs5',
    sessionId: 'cs_live_u1V2W3X4Y5',
    customer: 'Zoé Bernard',
    step: 'Completed',
    duration: '8m 44s',
    createdAt: '2026-05-16T08:30:00Z',
    status: 'completed',
    total: 80.0,
  },
];

const guestCheckouts = [
  {
    id: 'gc1',
    email: 'claire.m@hotmail.fr',
    items: 2,
    total: 76.0,
    country: 'FR',
    step: 'Completed',
    date: '2026-05-15T14:30:00Z',
  },
  {
    id: 'gc2',
    email: 'hans.m@gmx.de',
    items: 1,
    total: 38.0,
    country: 'DE',
    step: 'Abandoned – Payment',
    date: '2026-05-16T08:30:00Z',
  },
  {
    id: 'gc3',
    email: 'test@hotmail.fr',
    items: 1,
    total: 42.0,
    country: 'FR',
    step: 'Abandoned – Contact',
    date: '2026-05-15T18:55:00Z',
  },
  {
    id: 'gc4',
    email: 'anna.p@gmail.com',
    items: 2,
    total: 67.0,
    country: 'PL',
    step: 'Completed',
    date: '2026-05-14T11:20:00Z',
  },
];

const stepColors: Record<string, string> = {
  Contact: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipping: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Payment: 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function timeAgo(dateStr: string) {
  const now = new Date('2026-05-16T10:00:00Z');
  const diff = Math.round((now.getTime() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function AdminCheckoutPage() {
  const [activeTab, setActiveTab] = useState<CartTab>('abandoned');

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Checkout & Carts</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Monitor cart activity and checkout sessions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Active Carts',
            value: '3',
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Abandoned Today',
            value: '5',
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Checkout Sessions',
            value: '8',
            icon: Clock,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Recovery Potential',
            value: '€359',
            icon: RefreshCw,
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

      {/* Tabs */}
      <div className="flex gap-2">
        {tabsConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.id ? 'bg-[#111827] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Abandoned Carts */}
      {activeTab === 'abandoned' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827]">Abandoned Carts</h3>
            <p className="text-xs text-[#6B7280]">Last 24 hours</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Customer', 'Items', 'Value', 'Abandoned At Step', 'Time Ago', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {mockAbandonedCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#111827]">{cart.customer}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{cart.items}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                      €{cart.value.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stepColors[cart.step] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        {cart.step}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">
                      {timeAgo(cart.abandonedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] transition-colors">
                          <Send className="w-3 h-3" /> Recover
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Carts */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827]">Active Carts</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-emerald-600 font-medium">Live</p>
            </div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {activeCarts.map((cart) => (
              <div key={cart.id} className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{cart.customer}</p>
                      <p className="text-xs text-[#9CA3AF]">{cart.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stepColors[cart.step]}`}
                    >
                      Step: {cart.step}
                    </span>
                    <span className="text-sm font-bold text-[#111827]">
                      €{cart.value.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-[#6B7280]">
                  <span>
                    {cart.items} item{cart.items !== 1 ? 's' : ''}
                  </span>
                  {cart.coupon && (
                    <span className="px-2 py-0.5 rounded bg-[#F3F4F6] font-mono">
                      {cart.coupon}
                    </span>
                  )}
                  <span>Active {timeAgo(cart.updatedAt)}</span>
                </div>
                {/* Progress bar for checkout steps */}
                <div className="mt-3 flex items-center gap-1">
                  {['Contact', 'Shipping', 'Payment'].map((step, i) => {
                    const stepIndex = ['Contact', 'Shipping', 'Payment'].indexOf(cart.step);
                    return (
                      <div key={step} className="flex items-center gap-1 flex-1">
                        <div
                          className={`flex-1 h-1.5 rounded-full ${i <= stepIndex ? 'bg-[#111827]' : 'bg-[#E5E7EB]'}`}
                        />
                        {i < 2 && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${i < stepIndex ? 'bg-[#111827]' : i === stepIndex ? 'bg-[#111827] ring-2 ring-[#111827]/20' : 'bg-[#D1D5DB]'}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-1 flex justify-between text-xs text-[#9CA3AF]">
                  {['Contact', 'Shipping', 'Payment'].map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">Checkout Sessions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Session ID', 'Customer', 'Step', 'Status', 'Duration', 'Total', 'Started'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {checkoutSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#374151] truncate max-w-[140px]">
                      {session.sessionId}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111827]">{session.customer}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stepColors[session.step] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        {session.step}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${session.status === 'active' ? 'text-emerald-600' : session.status === 'completed' ? 'text-blue-600' : 'text-[#9CA3AF]'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${session.status === 'active' ? 'bg-emerald-400 animate-pulse' : session.status === 'completed' ? 'bg-blue-400' : 'bg-[#D1D5DB]'}`}
                        />
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{session.duration}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                      €{session.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">
                      {timeAgo(session.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest Checkouts */}
      {activeTab === 'guest' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827]">Guest Checkouts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Email', 'Country', 'Items', 'Total', 'Step/Status', 'Date', 'Action'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {guestCheckouts.map((gc) => (
                  <tr key={gc.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 text-sm text-[#111827]">{gc.email}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{gc.country}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{gc.items}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                      €{gc.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${gc.step === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                      >
                        {gc.step}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">
                      {new Date(gc.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {gc.step !== 'Completed' && (
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151]">
                          <Send className="w-3 h-3" /> Recover
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
