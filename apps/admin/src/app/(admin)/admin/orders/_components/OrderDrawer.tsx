'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Truck,
  CreditCard,
  User,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from 'lucide-react';

import type {
  OrderDetail,
  OrderStatus,
  PaymentStatus,
  OrderListResponse,
  OrderListQuery,
} from '../types';
import {
  getOrderAction,
  updateOrderStatusAction,
  updateShippingAction,
  updateShippingFeeAction,
  updatePaymentStatusAction,
  cancelOrderAction,
  listOrdersAction,
} from '../actions';

type ErrResult = { success: false; error: string };
const getErr = (r: unknown) => (r as ErrResult).error ?? 'Unknown error';

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

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  'pending',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
];

const CARRIERS = ['DHL', 'FedEx', 'UPS', 'PostNL', 'Royal Mail', 'DPD', 'GLS', 'Colissimo'];

function StatusBadge({ status, type }: { status: string; type: 'order' | 'payment' }) {
  const colorMap = type === 'order' ? ORDER_STATUS_COLORS : PAYMENT_STATUS_COLORS;
  const color =
    (colorMap as Record<string, string>)[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </h3>
  );
}

interface OrderDrawerProps {
  orderId: string;
  onClose: (refreshed?: OrderListResponse) => void;
  onRefresh?: (data: OrderListResponse) => void;
  currentQuery: OrderListQuery;
}

export function OrderDrawer({ orderId, onClose, onRefresh, currentQuery }: OrderDrawerProps) {
  const { t } = useTranslation('orders');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Status panel
  const [statusReason, setStatusReason] = useState('');

  // Shipping panel
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingFeeInput, setShippingFeeInput] = useState('');

  // Payment panel
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [paymentNote, setPaymentNote] = useState('');

  // Cancel panel
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Expanded sections
  const [expandedSection, setExpandedSection] = useState<string | null>('customer');

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      setActionSuccess(msg);
      setActionError(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(msg);
      setActionSuccess(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      const result = await getOrderAction(orderId);
      if (cancelled) return;
      if (result.success) {
        setOrder(result.data);
        setCarrier(result.data.carrier ?? '');
        setTrackingNumber(result.data.trackingNumber ?? '');
        setShippingFeeInput(Number(result.data.shippingFee).toFixed(2));
        setPaymentStatus(result.data.payment?.status ?? '');
      } else {
        setError(getErr(result));
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const refreshAndSync = async () => {
    const [orderResult, listResult] = await Promise.all([
      getOrderAction(orderId),
      listOrdersAction(currentQuery),
    ]);
    if (orderResult.success) setOrder(orderResult.data);
    return listResult.success ? listResult.data : undefined;
  };

  const handleStatusTransition = (newStatus: OrderStatus) => {
    setActionError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, {
        status: newStatus,
        reason: statusReason || undefined,
      });
      if (result.success) {
        setStatusReason('');
        setSelectedStatus('');
        showFeedback('success', t('drawer.successStatus', { status: newStatus }));
        const refreshed = await refreshAndSync();
        if (refreshed) onRefresh?.(refreshed);
      } else {
        showFeedback('error', getErr(result));
      }
    });
  };

  const handleUpdateShipping = () => {
    startTransition(async () => {
      const result = await updateShippingAction(orderId, {
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
      });
      if (result.success) {
        showFeedback('success', t('drawer.successShipping'));
        const refreshed = await refreshAndSync();
        if (refreshed) onRefresh?.(refreshed);
      } else {
        showFeedback('error', getErr(result));
      }
    });
  };

  const handleUpdateShippingFee = () => {
    const parsed = parseFloat(shippingFeeInput);
    if (isNaN(parsed) || parsed < 0) {
      showFeedback('error', t('drawer.errorInvalidFee'));
      return;
    }
    startTransition(async () => {
      const result = await updateShippingFeeAction(orderId, { shippingFee: parsed });
      if (result.success) {
        setOrder(result.data);
        setShippingFeeInput(Number(result.data.shippingFee).toFixed(2));
        showFeedback('success', t('drawer.successShippingFee'));
        const refreshed = await refreshAndSync();
        if (refreshed) onRefresh?.(refreshed);
      } else {
        showFeedback('error', getErr(result));
      }
    });
  };

  const handleUpdatePayment = () => {
    if (!paymentStatus) return;
    startTransition(async () => {
      const result = await updatePaymentStatusAction(orderId, {
        status: paymentStatus,
        note: paymentNote || undefined,
      });
      if (result.success) {
        const refreshed = await refreshAndSync();
        setPaymentNote('');
        showFeedback('success', t('drawer.successPayment', { status: paymentStatus }));
        if (refreshed) onClose(refreshed);
        else onClose();
      } else {
        showFeedback('error', getErr(result));
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelOrderAction(orderId, { reason: cancelReason || undefined });
      if (result.success) {
        setShowCancelConfirm(false);
        setCancelReason('');
        showFeedback('success', t('drawer.successCancelled'));
        const refreshed = await refreshAndSync();
        if (refreshed) onRefresh?.(refreshed);
      } else {
        showFeedback('error', getErr(result));
      }
    });
  };

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const availableStatuses = order
    ? ALL_ORDER_STATUSES.filter((s) => s !== order.status)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={() => onClose()} />
      <div className="relative w-full sm:max-w-xl bg-white h-[90vh] sm:h-full shadow-2xl flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-[#111827] font-mono">
              {order ? order.id.slice(0, 8).toUpperCase() : '—'}
            </h2>
            {order && (
              <p className="text-xs text-[#6B7280] mt-0.5">
                {new Date(order.createdAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => onClose()}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback bar */}
        {(actionSuccess || actionError) && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 flex-shrink-0 ${
              actionSuccess
                ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-200'
                : 'bg-red-50 text-red-700 border-b border-red-200'
            }`}
          >
            {actionSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {actionSuccess ?? actionError}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF]" />
            </div>
          )}

          {error && (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {order && (() => {
            const currencySymbol = order.currency === 'EUR' ? '€' : order.currency === 'GBP' ? '£' : '$';
            return (
            <>
              {/* Status badges */}
              <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-[#E5E7EB]">
                <StatusBadge status={order.status} type="order" />
                {order.payment && <StatusBadge status={order.payment.status} type="payment" />}
                {order.shippingSnapshot.shippingMethodName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
                    {order.shippingSnapshot.shippingMethodName}
                  </span>
                )}
              </div>

              {/* Customer & Address */}
              <CollapsibleSection
                title={t('drawer.customerShipping')}
                icon={User}
                sectionKey="customer"
                expanded={expandedSection}
                onToggle={setExpandedSection}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#111827] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {(order.user?.fullName ?? order.contactSnapshot.fullName)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827]">
                      {order.user?.fullName ?? order.contactSnapshot.fullName}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {order.user?.email ?? order.contactSnapshot.email}
                    </p>
                    {order.contactSnapshot.phone && (
                      <p className="text-xs text-[#9CA3AF]">{order.contactSnapshot.phone}</p>
                    )}
                    <div className="mt-2 text-xs text-[#6B7280] space-y-0.5">
                      <p>{order.shippingSnapshot.recipientName}</p>
                      <p>{order.shippingSnapshot.street}</p>
                      <p>
                        {order.shippingSnapshot.city}
                        {order.shippingSnapshot.postalCode
                          ? `, ${order.shippingSnapshot.postalCode}`
                          : ''}
                      </p>
                      <p className="font-medium">{order.shippingSnapshot.country}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Order Items */}
              <CollapsibleSection
                title={t('drawer.itemsCount', { count: order.items?.length ?? 0 })}
                icon={Package}
                sectionKey="items"
                expanded={expandedSection}
                onToggle={setExpandedSection}
              >
                <div className="space-y-3">
                  {(order.items ?? []).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.productName ?? ''}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#F3F4F6]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0 text-sm">
                          💅
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {item.productName && (
                          <p className="text-xs font-semibold text-[#111827] truncate">
                            {item.productName}
                          </p>
                        )}
                        <p className="text-xs text-[#6B7280]">
                          {item.shapeName} · {item.sizeLabel}
                          {item.sku && <span className="text-[#9CA3AF]"> · {item.sku}</span>}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          Qty: {item.quantity}
                          {item.isCustomSize && ' · Custom size'}
                        </p>
                        {item.customSizeRequest?.notes && (
                          <p className="text-xs text-[#6B7280] italic mt-0.5 line-clamp-3">
                            "{item.customSizeRequest.notes}"
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#111827] flex-shrink-0">
                        {currencySymbol}{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#F3F4F6] space-y-1">
                  <div className="flex justify-between text-xs text-[#6B7280]">
                    <span>{t('drawer.subtotal')}</span>
                    <span>{currencySymbol}{Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span className="flex items-center gap-1.5">
                        {t('drawer.discount')}
                        {order.couponCode && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium font-mono">
                            {order.couponCode}
                          </span>
                        )}
                      </span>
                      <span>−{currencySymbol}{Number(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1.5">
                      {t('drawer.shipping')}
                      {order.shippingSnapshot.shippingMethodName && (
                        <span className="px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-medium">
                          {order.shippingSnapshot.shippingMethodName}
                        </span>
                      )}
                    </span>
                    <span>{currencySymbol}{Number(order.shippingFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#111827] pt-1 border-t border-[#F3F4F6]">
                    <span>{t('drawer.total')}</span>
                    <span>{currencySymbol}{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Shipping Management */}
              <CollapsibleSection
                title={t('drawer.shippingMgmt')}
                icon={Truck}
                sectionKey="shipping"
                expanded={expandedSection}
                onToggle={setExpandedSection}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#374151] block mb-1">{t('drawer.carrier')}</label>
                    <div className="flex gap-2">
                      <select
                        value={CARRIERS.includes(carrier) ? carrier : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value !== '__custom__') setCarrier(e.target.value);
                        }}
                        className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none"
                      >
                        <option value="">{t('drawer.noCarrier')}</option>
                        {CARRIERS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        {carrier && !CARRIERS.includes(carrier) && (
                          <option value="__custom__">{carrier}</option>
                        )}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder={t('drawer.carrierPlaceholder')}
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#374151] block mb-1">
                      {t('drawer.trackingNumber')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('drawer.trackingPlaceholder')}
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                    />
                  </div>
                  <button
                    onClick={handleUpdateShipping}
                    disabled={isPending}
                    className="w-full px-4 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    {t('drawer.saveShipping')}
                  </button>

                  <div className="pt-3 border-t border-[#F3F4F6]">
                    <label className="text-xs font-medium text-[#374151] block mb-1">
                      {t('drawer.shippingOverride', { currency: order.currency })}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={shippingFeeInput}
                        onChange={(e) => setShippingFeeInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                        placeholder="0.00"
                      />
                      <button
                        onClick={handleUpdateShippingFee}
                        disabled={isPending || shippingFeeInput === Number(order.shippingFee).toFixed(2)}
                        className="px-4 py-2 rounded-lg border border-[#111827] text-[#111827] text-xs font-medium hover:bg-[#F3F4F6] disabled:opacity-40 flex items-center gap-1.5"
                      >
                        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        {t('drawer.applyFee')}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">
                      {t('drawer.shippingOverrideHint')}
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Payment Management */}
              {order.payment && (
                <CollapsibleSection
                  title={t('drawer.payment')}
                  icon={CreditCard}
                  sectionKey="payment"
                  expanded={expandedSection}
                  onToggle={setExpandedSection}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#9CA3AF]">{t('drawer.gateway')}</span>
                        <p className="font-medium text-[#111827] capitalize mt-0.5">
                          {order.payment.gateway}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF]">{t('drawer.amount')}</span>
                        <p className="font-medium text-[#111827] mt-0.5">
                          {currencySymbol}{Number(order.payment.amount).toFixed(2)}
                        </p>
                      </div>
                      {order.payment.gatewayTxnId && (
                        <div className="col-span-2">
                          <span className="text-[#9CA3AF]">{t('drawer.txnId')}</span>
                          <p className="font-mono text-xs text-[#111827] mt-0.5 truncate">
                            {order.payment.gatewayTxnId}
                          </p>
                        </div>
                      )}
                      {order.payment.paidAt && (
                        <div className="col-span-2">
                          <span className="text-[#9CA3AF]">{t('drawer.paidAt')}</span>
                          <p className="text-[#111827] mt-0.5">
                            {new Date(order.payment.paidAt).toLocaleString('en-GB')}
                          </p>
                        </div>
                      )}
                      {order.payment.paypalDetail && (
                        <div className="col-span-2">
                          <span className="text-[#9CA3AF]">{t('drawer.paypalEmail')}</span>
                          <p className="text-[#111827] mt-0.5">
                            {order.payment.paypalDetail.payerEmail}
                          </p>
                        </div>
                      )}
                      {order.payment.cardDetail && (
                        <div className="col-span-2">
                          <span className="text-[#9CA3AF]">{t('drawer.card')}</span>
                          <p className="text-[#111827] mt-0.5 capitalize">
                            {order.payment.cardDetail.brand} ···· {order.payment.cardDetail.last4}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#F3F4F6]">
                      <label className="text-xs font-medium text-[#374151] block mb-1">
                        {t('drawer.updatePaymentStatus')}
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none mb-2"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder={t('drawer.adminNote')}
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] mb-2"
                      />
                      <button
                        onClick={handleUpdatePayment}
                        disabled={isPending || !paymentStatus}
                        className="w-full px-4 py-2 rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#374151] disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        {t('drawer.updatePayment')}
                      </button>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {/* Status Workflow */}
              {order && (
                <div className="px-6 py-4 border-t border-[#E5E7EB]">
                  <SectionHeader icon={CheckCircle2} title={t('drawer.updateOrderStatus')} />
                  <div className="space-y-3">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827] capitalize bg-white"
                    >
                      <option value="">{t('drawer.selectStatus')}</option>
                      {availableStatuses.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={t('drawer.changeReason')}
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#111827]"
                    />
                    <button
                      onClick={() => selectedStatus && handleStatusTransition(selectedStatus)}
                      disabled={!selectedStatus || isPending}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        selectedStatus === 'cancelled'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-[#111827] bg-[#111827] text-white hover:bg-[#374151]'
                      }`}
                    >
                      {isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : selectedStatus ? (
                        `→ ${selectedStatus}`
                      ) : (
                        t('drawer.selectStatusHint')
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel Section */}
              {order.status !== 'cancelled' &&
                order.status !== 'delivered' &&
                order.status !== 'refunded' && (
                  <div className="px-6 py-4 border-t border-[#E5E7EB]">
                    {!showCancelConfirm ? (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        {t('drawer.cancelOrder')}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-red-600">{t('drawer.confirmCancel')}</p>
                        <input
                          type="text"
                          placeholder={t('drawer.cancelReason')}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm outline-none focus:border-red-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            disabled={isPending}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            {t('drawer.confirmCancelBtn')}
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] text-xs font-medium hover:bg-[#F3F4F6]"
                          >
                            {t('drawer.back')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Internal Notes */}
              {order.internalNotes && (
                <div className="px-6 py-4 border-t border-[#E5E7EB]">
                  <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-2">
                    {t('drawer.notes')}
                  </h3>
                  <pre className="text-xs text-[#6B7280] whitespace-pre-wrap font-mono bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                    {order.internalNotes}
                  </pre>
                </div>
              )}
            </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  sectionKey,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ElementType;
  sectionKey: string;
  expanded: string | null;
  onToggle: (key: string | null) => void;
  children: React.ReactNode;
}) {
  const isOpen = expanded === sectionKey;

  return (
    <div className="border-t border-[#E5E7EB]">
      <button
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#F9FAFB] transition-colors"
        onClick={() => onToggle(isOpen ? null : sectionKey)}
      >
        <span className="text-xs font-semibold text-[#374151] uppercase tracking-wider flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="px-6 pb-4">{children}</div>}
    </div>
  );
}
