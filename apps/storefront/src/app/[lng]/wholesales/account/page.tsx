'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building2, Star, CreditCard, ArrowRight, Package, ChevronLeft } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import {
  useWholesaleAccount,
  useWholesaleOrders,
} from '@/features/wholesale/hooks/useWholesaleAccount';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: '#FDF6EC', text: '#92400E', border: '#D97706' },
  Silver: { bg: '#F8F8F8', text: '#374151', border: '#9CA3AF' },
  Gold: { bg: '#FFFBEB', text: '#78350F', border: '#F59E0B' },
};

const PAYMENT_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  unpaid: { bg: '#FEF2F2', text: '#DC2626', label: 'Unpaid' },
  partial: { bg: '#FFFBEB', text: '#D97706', label: 'Partial' },
  paid: { bg: '#F0FDF4', text: '#16A34A', label: 'Paid' },
  overdue: { bg: '#FFF1F2', text: '#BE123C', label: 'Overdue' },
};

function StatusBadge({ status }: { status: string }) {
  const style = PAYMENT_STATUS_STYLES[status] ?? { bg: '#F3F4F6', text: '#6B7280', label: status };
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-sm font-medium"
      style={{ backgroundColor: style.bg, color: style.text, letterSpacing: '0.08em' }}
    >
      {style.label}
    </span>
  );
}

function TierBadge({ name }: { name: string }) {
  const colors = TIER_COLORS[name] ?? TIER_COLORS['Bronze'];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-widest"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: '0.12em',
      }}
    >
      <Star className="size-3" aria-hidden />
      {name}
    </span>
  );
}

export default function WholesaleAccountPage() {
  const params = useParams<{ lng?: string }>();
  const lng = params.lng ?? 'en';
  const [page, setPage] = useState(1);

  const { status: authStatus } = useAppSelector((s) => s.auth);
  const { data: account, isLoading: accountLoading, error: accountError } = useWholesaleAccount();
  const {
    data: ordersData,
    isLoading: ordersLoading,
  } = useWholesaleOrders({ page, limit: 10 });

  // Not logged in
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
            <Building2 className="size-6 text-[#9A9A9A]" />
          </div>
          <h1
            className="text-[#1A1A1A] mb-3"
            style={{
              fontWeight: 400,
              fontSize: '1.5rem',
            }}
          >
            Sign In Required
          </h1>
          <p className="text-[#6A6A6A] text-sm mb-6">
            Please sign in to access your wholesale account dashboard.
          </p>
          <Link
            href={`/${lng}/auth/login`}
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
            style={{ letterSpacing: '0.12em' }}
          >
            Sign In <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (accountLoading) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center">
        <div className="size-8 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated but not a wholesale customer
  if (accountError || !account) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="size-14 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
            <Star className="size-6 text-[#9A9A9A]" />
          </div>
          <h1
            className="text-[#1A1A1A] mb-3"
            style={{
              fontWeight: 400,
              fontSize: '1.5rem',
            }}
          >
            No Wholesale Account
          </h1>
          <p className="text-[#6A6A6A] text-sm mb-6">
            You don't have an active wholesale account. Submit an enquiry to start your B2B
            partnership with Silver14 Nail.
          </p>
          <Link
            href={`/${lng}/wholesales`}
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
            style={{ letterSpacing: '0.12em' }}
          >
            Apply Now <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);

  const totalPages = ordersData?.pagination.totalPages ?? 1;

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href={`/${lng}/wholesales`}
          className="inline-flex items-center gap-1.5 text-[#9A9A9A] text-xs mb-8 hover:text-[#1A1A1A] transition-colors"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          Wholesale Programme
        </Link>

        <h1
          className="text-[#1A1A1A] mb-8"
          style={{
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          }}
        >
          Wholesale Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Account info card */}
          <div className="lg:col-span-2 bg-white p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <Building2 className="size-5 text-[#6A6A6A]" aria-hidden />
                </div>
                <div>
                  <p
                    className="text-[#1A1A1A]"
                    style={{
                      fontWeight: 500,
                      fontSize: '1.1rem',
                    }}
                  >
                    {account.businessName ?? 'Wholesale Account'}
                  </p>
                  <p className="text-[#9A9A9A] text-xs">{account.country}</p>
                </div>
              </div>
              {account.tier && <TierBadge name={account.tier.name} />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Status" value={account.isActive ? 'Active' : 'Inactive'} />
              {account.approvedAt && (
                <InfoRow
                  label="Member since"
                  value={new Date(account.approvedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                />
              )}
              {account.tier && (
                <>
                  <InfoRow
                    label="Tier discount"
                    value={`${Number(account.tier.discountPercent)}% off retail`}
                  />
                  <InfoRow
                    label="Shipping"
                    value={account.tier.freeShipping ? 'Free shipping' : 'Standard rates'}
                  />
                  {Number(account.tier.minOrderAmount) > 0 && (
                    <InfoRow
                      label="Min. order"
                      value={fmt(Number(account.tier.minOrderAmount))}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Credit card */}
          <div className="bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="size-4 text-[#9A9A9A]" aria-hidden />
              <span
                className="text-[#1A1A1A] text-xs uppercase tracking-widest"
                style={{ letterSpacing: '0.12em' }}
              >
                Credit
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[#9A9A9A] text-xs mb-1">Credit Limit</p>
                <p
                  className="text-[#1A1A1A]"
                  style={{
                    fontWeight: 500,
                    fontSize: '1.4rem',
                  }}
                >
                  {fmt(Number(account.creditLimit))}
                </p>
              </div>
              <div>
                <p className="text-[#9A9A9A] text-xs mb-1">Outstanding Balance</p>
                <p
                  className="text-[#1A1A1A]"
                  style={{
                    fontWeight: 500,
                    fontSize: '1.4rem',
                  }}
                >
                  {fmt(Number(account.currentBalance))}
                </p>
              </div>
              {Number(account.creditLimit) > 0 && (
                <div>
                  <p className="text-[#9A9A9A] text-xs mb-1.5">Available</p>
                  <div className="w-full bg-[#F0F0F0] h-1.5">
                    <div
                      className="bg-[#4A7A5A] h-1.5 transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, ((Number(account.creditLimit) - Number(account.currentBalance)) / Number(account.creditLimit)) * 100)).toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[#6A6A6A] text-[10px] mt-1">
                    {fmt(Number(account.creditLimit) - Number(account.currentBalance))} available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders section */}
        <div className="bg-white">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
            <Package className="size-4 text-[#9A9A9A]" aria-hidden />
            <span
              className="text-[#1A1A1A] text-xs uppercase tracking-widest"
              style={{ letterSpacing: '0.12em' }}
            >
              Order History
            </span>
            {ordersData && (
              <span className="ml-auto text-[#9A9A9A] text-xs">
                {ordersData.pagination.totalItems} orders
              </span>
            )}
          </div>

          {ordersLoading ? (
            <div className="p-12 text-center">
              <div className="size-6 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
            </div>
          ) : !ordersData?.items.length ? (
            <div className="p-12 text-center">
              <p className="text-[#9A9A9A] text-sm">No orders yet.</p>
              <Link
                href={`/${lng}/products`}
                className="inline-flex items-center gap-1.5 text-[#1A1A1A] text-xs mt-4 hover:underline"
              >
                Browse collections <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F8F8F8] text-[#9A9A9A] uppercase tracking-widest">
                    <tr>
                      {['Order ID', 'Date', 'Total', 'Discount', 'Payment Terms', 'Status'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left font-normal"
                            style={{ letterSpacing: '0.08em' }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {ordersData.items.map((wo) => (
                      <tr key={wo.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4 text-[#1A1A1A]">
                          {wo.order?.id?.slice(0, 8) ?? wo.id.slice(0, 8)}…
                        </td>
                        <td className="px-6 py-4 text-[#6A6A6A]">
                          {new Date(wo.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-[#1A1A1A]">
                          {wo.order?.total != null
                            ? new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: wo.order.currency ?? 'USD',
                              }).format(Number(wo.order.total))
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-[#4A7A5A]">
                          {Number(wo.wholesaleDiscount) > 0
                            ? `-${fmt(Number(wo.wholesaleDiscount))}`
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-[#6A6A6A] uppercase">{wo.paymentTerms}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={wo.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#F0F0F0]">
                {ordersData.items.map((wo) => (
                  <div key={wo.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-[#1A1A1A] text-xs">
                        {wo.order?.id?.slice(0, 8) ?? wo.id.slice(0, 8)}…
                      </p>
                      <StatusBadge status={wo.paymentStatus} />
                    </div>
                    <p className="text-[#9A9A9A] text-xs">
                      {new Date(wo.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {wo.order?.total != null && (
                      <p className="text-[#1A1A1A] text-sm">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: wo.order.currency ?? 'USD',
                        }).format(Number(wo.order.total))}
                        {Number(wo.wholesaleDiscount) > 0 && (
                          <span className="text-[#4A7A5A] ml-2 text-xs">
                            (−{fmt(Number(wo.wholesaleDiscount))})
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-[#6A6A6A] text-xs uppercase tracking-wide">
                      {wo.paymentTerms}
                      {wo.dueDate && ` · Due ${new Date(wo.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
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
                    ← Previous
                  </button>
                  <span className="text-[#9A9A9A] text-xs">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-xs text-[#6A6A6A] disabled:opacity-40 hover:text-[#1A1A1A] transition-colors"
                  >
                    Next →
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#9A9A9A] text-[10px] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[#1A1A1A] text-sm">{value}</p>
    </div>
  );
}
