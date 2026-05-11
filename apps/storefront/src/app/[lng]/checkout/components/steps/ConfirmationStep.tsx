'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useT } from 'next-i18next/client';

interface ConfirmationStepProps {
  orderId: string;
  firstName: string;
  email: string;
  phone: string;
}

export function ConfirmationStep({ orderId, firstName, email, phone }: ConfirmationStepProps) {
  const { t } = useT('checkout');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white p-8 sm:p-12 text-center">
        <div className="size-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="size-7 text-[#4A7A5A]" aria-hidden />
        </div>

        <p
          className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3"
          style={{ letterSpacing: '0.2em' }}
        >
          {t('confirmation.badge')}
        </p>

        <h2
          className="text-[#1A1A1A] mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          }}
        >
          {t('confirmation.heading', { firstName })}
        </h2>

        <p className="text-[#6A6A6A] text-sm mb-8 leading-relaxed max-w-md mx-auto">
          {t('confirmation.description', { email })}
        </p>

        {/* Order ID */}
        <div className="bg-[#F8F8F8] p-6 mb-8 max-w-xs mx-auto">
          <p
            className="text-[#9A9A9A] text-xs uppercase tracking-widest mb-2"
            style={{ letterSpacing: '0.12em' }}
          >
            {t('confirmation.orderIdLabel')}
          </p>
          <p
            className="text-[#1A1A1A] text-lg"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {orderId}
          </p>
          <p className="text-[#9A9A9A] text-xs mt-2">{t('confirmation.orderIdHint')}</p>
        </div>

        <p className="text-[#9A9A9A] text-xs mb-8 p-3 bg-[#F8F8F8] max-w-sm mx-auto">
          {t('confirmation.trackHint', { phone })}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/order/tracking"
            className="inline-flex items-center justify-center gap-2 border border-[#1A1A1A] text-[#1A1A1A] px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all"
            style={{ letterSpacing: '0.12em' }}
          >
            {t('confirmation.trackOrder')}
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
            style={{ letterSpacing: '0.12em' }}
          >
            {t('confirmation.continueShopping')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
