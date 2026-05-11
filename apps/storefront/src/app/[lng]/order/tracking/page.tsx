'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useT } from 'next-i18next/client';
import { AlertCircle } from 'lucide-react';

import { useOrderTracking } from './hooks/useOrderTracking';
import { TrackForm, OrderResult } from './components';

export default function OrderTrackingPage() {
  const { t } = useT('tracking');
  const { formData, result, loading, handleInputChange, trackOrder } = useOrderTracking();

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <div className="text-center py-16 px-4 border-b border-[#E8E8E8]">
        <p className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3">{t('subtitle')}</p>
        <h1
          className="text-[#1A1A1A]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          }}
        >
          {t('title')}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <TrackForm
          formData={formData}
          loading={loading}
          onChange={handleInputChange}
          onSubmit={trackOrder}
        />

        <AnimatePresence mode="wait">
          {result === null && <NotFound />}
          {result && <OrderResult order={result} />}
        </AnimatePresence>

        <div className="text-center mt-8">
          <p className="text-[#9A9A9A] text-xs">
            {t('help')}{' '}
            <a
              href="mailto:hello@silver14nail.com"
              className="text-[#1A1A1A] underline hover:text-black"
            >
              {t('contactUs')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  const { t } = useT('tracking');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white p-6 text-center"
    >
      <AlertCircle className="size-8 text-[#C0C0C0] mx-auto mb-3" />
      <p className="text-[#1A1A1A] text-sm mb-1">{t('notFound.title')}</p>
      <p className="text-[#9A9A9A] text-xs">{t('notFound.description')}</p>
    </motion.div>
  );
}
