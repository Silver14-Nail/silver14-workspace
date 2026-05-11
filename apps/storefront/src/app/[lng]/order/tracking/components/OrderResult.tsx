'use client';

import { motion } from 'motion/react';
import { useT } from 'next-i18next/client';

import StatusTimeline from './StatusTimeLine';
import ShippingInfo from './ShippingInfo';
import OrderSummary from './OrderSummary';

import StatusBadge from './ui/StatusBadge';
import { MockOrder } from '@/context/CartContext';

export default function OrderResult({ order }: { order: MockOrder }) {
  const { t } = useT('tracking');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 sm:p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[#9A9A9A] text-xs uppercase tracking-widest mb-1">{t('order')}</p>
          <p
            className="text-[#1A1A1A] text-xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {order.id}
          </p>
          <p className="text-[#9A9A9A] text-xs mt-1">
            {t('placedOn')}{' '}
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <StatusTimeline status={order.status} />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ShippingInfo address={order.shippingAddress} />
        <OrderSummary items={order.items} total={order.total} />
      </div>
    </motion.div>
  );
}
