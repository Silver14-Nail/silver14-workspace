'use client';

import { useParams } from 'next/navigation';
import {
  Package,
  MapPin,
  Truck,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useT } from 'next-i18next/client';
import { useAppSelector } from '@/store/hooks';
import { useCustomerOrderDetail } from '@/features/orders/hooks/useCustomerOrderDetail';
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

type DisplayStep = 'Processing' | 'Crafting' | 'Shipped' | 'Delivered';

const TIMELINE_STEPS: { key: DisplayStep; label: string; desc: string }[] = [
  { key: 'Processing', label: 'Order Received', desc: 'Your order has been confirmed.' },
  { key: 'Crafting', label: 'Handcrafting', desc: 'Our artisans are crafting your nails.' },
  { key: 'Shipped', label: 'Shipped', desc: 'Your order is on its way.' },
  { key: 'Delivered', label: 'Delivered', desc: 'Your order has been delivered.' },
];

function mapToDisplayStatus(status: string): DisplayStep | 'cancelled' | 'refunded' {
  switch (status) {
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'processing':
      return 'Crafting';
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
      return 'refunded';
    default:
      return 'Processing';
  }
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const style = ORDER_STATUS_STYLES[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span
      className="inline-block px-2.5 py-1 text-[10px] uppercase rounded-sm font-medium"
      style={{ backgroundColor: style.bg, color: style.text, letterSpacing: '0.08em' }}
    >
      {label}
    </span>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const displayStatus = mapToDisplayStatus(status);
  if (displayStatus === 'cancelled' || displayStatus === 'refunded') return null;

  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === displayStatus);

  return (
    <div className="relative">
      <div className="absolute top-5 left-5 right-5 h-px bg-[#E5E5E5] hidden sm:block" />
      <div
        className="absolute top-5 left-5 h-px bg-[#1A1A1A] hidden sm:block transition-all duration-700"
        style={{
          width: `${(currentIdx / (TIMELINE_STEPS.length - 1)) * 100}%`,
        }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {TIMELINE_STEPS.map((step, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const Icon = isDone ? CheckCircle2 : i < currentIdx ? Clock : Circle;

          return (
            <div
              key={step.key}
              className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-0 sm:text-center"
            >
              <div
                className={`relative z-10 size-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isDone
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-white border-2 border-[#E5E5E5] text-[#D0D0D0]'
                } ${isCurrent ? 'ring-4 ring-[#1A1A1A]/10' : ''}`}
              >
                <Icon className="size-4" />
              </div>
              <div className="sm:mt-3">
                <p
                  className={`text-xs uppercase ${isDone ? 'text-[#1A1A1A]' : 'text-[#C0C0C0]'}`}
                  style={{ letterSpacing: '0.08em' }}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-[#6A6A6A] mt-1 hidden sm:block">{step.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId?: string }>();
  const orderId = params.orderId ?? '';
  const { t } = useT('account');

  const { status: authStatus } = useAppSelector((s) => s.auth);
  const { data: order, isLoading, error } = useCustomerOrderDetail(orderId);

  if (authStatus === 'checking' || isLoading) {
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

  if (error || !order) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="size-14 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
            <XCircle className="size-6 text-[#9A9A9A]" />
          </div>
          <h1
            className="text-[#1A1A1A] mb-3"
            style={{ fontWeight: 400, fontSize: '1.5rem' }}
          >
            {t('orders.detail.notFound')}
          </h1>
          <p className="text-[#6A6A6A] text-sm mb-6">{t('orders.detail.notFoundDesc')}</p>
          <LinkBase
            href="/account/orders"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-[0.12em] hover:bg-[#333] transition-colors"
          >
            {t('orders.title')} <ArrowRight className="size-3.5" />
          </LinkBase>
        </div>
      </div>
    );
  }

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(amount);
  const statusLabel = (t(`orders.statusLabel.${order.status}`) as string) || order.status;

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LinkBase
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-[#9A9A9A] text-xs mb-8 hover:text-[#1A1A1A] transition-colors"
        >
          ← {t('orders.detail.backToOrders').replace('← ', '')}
        </LinkBase>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1
              className="text-[#1A1A1A]"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              }}
            >
              {t('orders.detail.title')}
            </h1>
            <p className="text-[#9A9A9A] text-xs mt-1">{order.id}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={order.status} label={statusLabel} />
            <p className="text-[#9A9A9A] text-xs mt-2">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Status timeline */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="bg-white p-6 mb-6">
            <OrderTimeline status={order.status} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: shipping + items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking number */}
            <div className="bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="size-4 text-[#9A9A9A]" aria-hidden />
                <span className="text-[#1A1A1A] text-xs uppercase" style={{ letterSpacing: '0.12em' }}>
                  {t('orders.detail.trackingNumber')}
                </span>
              </div>
              {order.trackingNumber ? (
                <p className="text-[#1A1A1A] text-sm">{order.trackingNumber}</p>
              ) : (
                <p className="text-[#9A9A9A] text-sm">{t('orders.detail.noTracking')}</p>
              )}
            </div>

            {/* Shipping address */}
            <div className="bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="size-4 text-[#9A9A9A]" aria-hidden />
                <span className="text-[#1A1A1A] text-xs uppercase" style={{ letterSpacing: '0.12em' }}>
                  {t('orders.detail.shippingAddress')}
                </span>
              </div>
              <address className="not-italic text-[#6A6A6A] text-sm space-y-0.5">
                <p>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ''}
                </p>
                <p>{order.shippingAddress.country}</p>
              </address>
              {order.shippingAddress.shippingMethodName && (
                <p className="text-[#9A9A9A] text-xs mt-3">
                  {t('orders.detail.shippingMethod')}:{' '}
                  <span className="text-[#1A1A1A]">{order.shippingAddress.shippingMethodName}</span>
                </p>
              )}
            </div>

            {/* Items */}
            <div className="bg-white">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[#F0F0F0]">
                <Package className="size-4 text-[#9A9A9A]" aria-hidden />
                <span className="text-[#1A1A1A] text-xs uppercase" style={{ letterSpacing: '0.12em' }}>
                  {t('orders.detail.orderItems')}
                </span>
              </div>
              <ul className="divide-y divide-[#F0F0F0]">
                {order.items.map((item, i) => (
                  <li key={i} className="px-6 py-4 flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1A1A1A] text-sm truncate">{item.productName}</p>
                      <p className="text-[#9A9A9A] text-xs mt-0.5">
                        {[item.shapeName, item.sizeName].filter(Boolean).join(' · ')}
                        {(item.shapeName || item.sizeName) ? ' · ' : ''}×{item.quantity}
                      </p>
                    </div>
                    <p className="text-[#1A1A1A] text-sm whitespace-nowrap">{fmt(item.lineTotal)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: price summary */}
          <div className="bg-white p-6 h-fit">
            <p className="text-[#1A1A1A] text-xs uppercase mb-4" style={{ letterSpacing: '0.12em' }}>
              Summary
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#6A6A6A]">
                <span>{t('orders.detail.subtotal')}</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-[#4A7A5A]">
                  <span>{t('orders.detail.discount')}</span>
                  <span>−{fmt(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6A6A6A]">
                <span>{t('orders.detail.shippingFee')}</span>
                <span>{Number(order.shippingFee) === 0 ? 'Free' : fmt(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-[#1A1A1A] font-medium border-t border-[#F0F0F0] pt-3">
                <span>{t('orders.detail.total')}</span>
                <span>{fmt(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
