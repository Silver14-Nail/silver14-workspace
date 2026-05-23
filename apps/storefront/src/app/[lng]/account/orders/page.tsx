'use client';

import { useState } from 'react';
import { Package, ArrowRight, ChevronLeft, User } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { useAppSelector } from '@/store/hooks';
import { useCustomerOrders } from '@/features/orders/hooks/useCustomerOrders';
import { LinkBase } from '@/components/shared/LinkBase';

const ORDER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#F8F8F8', text: '#6A6A6A' },
  confirmed: { bg: '#EFF6FF', text: '#1D4ED8' },
  processing: { bg: '#FFFBEB', text: '#D97706' },
  shipped: { bg: '#F0FDF4', text: '#16A34A' },
  delivered: { bg: '#F0FDF4', text: '#15803D' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
  refunded: { bg: '#FDF4FF', text: '#9333EA' },
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const style = ORDER_STATUS_STYLES[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] uppercase rounded-sm font-medium"
      style={{ backgroundColor: style.bg, color: style.text, letterSpacing: '0.08em' }}
    >
      {label}
    </span>
  );
}

export default function AccountOrdersPage() {
  const { t } = useT('account');
  const [page, setPage] = useState(1);

  const { status: authStatus } = useAppSelector((s) => s.auth);
  const { data: ordersData, isLoading } = useCustomerOrders({ page, limit: 10 });

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center">
        <div className="size-8 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="size-14 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
            <User className="size-6 text-[#9A9A9A]" />
          </div>
          <h1
            className="text-[#1A1A1A] mb-3"
            style={{
              fontWeight: 400,
              fontSize: '1.5rem',
            }}
          >
            {t('signInTitle')}
          </h1>
          <p className="text-[#6A6A6A] text-sm mb-6">{t('guestDescription')}</p>
          <LinkBase
            href="/account"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-[0.12em] hover:bg-[#333] transition-colors"
          >
            {t('signIn')} <ArrowRight className="size-3.5" />
          </LinkBase>
        </div>
      </div>
    );
  }

  const totalPages = ordersData?.pagination.totalPages ?? 1;
  const fmt = (amount: number, currency = 'EUR') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  const statusLabel = (status: string) => (t(`orders.statusLabel.${status}`) as string) || status;

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LinkBase
          href="/account"
          className="inline-flex items-center gap-1.5 text-[#9A9A9A] text-xs mb-8 hover:text-[#1A1A1A] transition-colors"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          {t('customerAccount')}
        </LinkBase>

        <h1
          className="text-[#1A1A1A] mb-8"
          style={{
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          }}
        >
          {t('orders.title')}
        </h1>

        <div className="bg-white">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
            <Package className="size-4 text-[#9A9A9A]" aria-hidden />
            <span className="text-[#1A1A1A] text-xs uppercase" style={{ letterSpacing: '0.12em' }}>
              {t('orders.title')}
            </span>
            {ordersData && (
              <span className="ml-auto text-[#9A9A9A] text-xs">
                {ordersData.pagination.totalItems}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="size-6 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
            </div>
          ) : !ordersData?.items.length ? (
            <div className="p-12 text-center">
              <p className="text-[#9A9A9A] text-sm">{t('orders.empty')}</p>
              <LinkBase
                href="/products"
                className="inline-flex items-center gap-1.5 text-[#1A1A1A] text-xs mt-4 hover:underline"
              >
                {t('orders.browse')} <ArrowRight className="size-3.5" />
              </LinkBase>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F8F8F8] text-[#9A9A9A] uppercase">
                    <tr>
                      <th
                        className="px-6 py-3 text-left font-normal"
                        style={{ letterSpacing: '0.08em' }}
                      >
                        {t('orders.orderId')}
                      </th>
                      <th
                        className="px-6 py-3 text-left font-normal"
                        style={{ letterSpacing: '0.08em' }}
                      >
                        {t('orders.date')}
                      </th>
                      <th
                        className="px-6 py-3 text-left font-normal"
                        style={{ letterSpacing: '0.08em' }}
                      >
                        {t('orders.itemCount')}
                      </th>
                      <th
                        className="px-6 py-3 text-left font-normal"
                        style={{ letterSpacing: '0.08em' }}
                      >
                        {t('orders.total')}
                      </th>
                      <th
                        className="px-6 py-3 text-left font-normal"
                        style={{ letterSpacing: '0.08em' }}
                      >
                        Status
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {ordersData.items.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4 text-[#1A1A1A]">
                          {order.id.slice(0, 8)}…
                        </td>
                        <td className="px-6 py-4 text-[#6A6A6A]">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-[#6A6A6A]">{order.itemCount}</td>
                        <td className="px-6 py-4 text-[#1A1A1A]">
                          {fmt(order.total, order.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} label={statusLabel(order.status)} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <LinkBase
                            href={`/account/orders/${order.id}`}
                            className="text-[#1A1A1A] text-xs hover:underline inline-flex items-center gap-1"
                          >
                            View <ArrowRight className="size-3" />
                          </LinkBase>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#F0F0F0]">
                {ordersData.items.map((order) => (
                  <LinkBase
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="block p-4 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[#1A1A1A] text-xs">{order.id.slice(0, 8)}…</p>
                      <StatusBadge status={order.status} label={statusLabel(order.status)} />
                    </div>
                    <p className="text-[#9A9A9A] text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[#1A1A1A] text-sm">{fmt(order.total, order.currency)}</p>
                      <span className="text-[#9A9A9A] text-xs">
                        {order.itemCount} {t('orders.itemCount').toLowerCase()}
                      </span>
                    </div>
                  </LinkBase>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0F0F0]">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-xs text-[#6A6A6A] disabled:opacity-40 hover:text-[#1A1A1A] transition-colors"
                  >
                    {t('orders.previous')}
                  </button>
                  <span className="text-[#9A9A9A] text-xs">
                    {(t('orders.page') as string)
                      .replace('{{page}}', String(page))
                      .replace('{{total}}', String(totalPages))}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-xs text-[#6A6A6A] disabled:opacity-40 hover:text-[#1A1A1A] transition-colors"
                  >
                    {t('orders.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
