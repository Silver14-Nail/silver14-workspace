'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useT } from 'next-i18next/client';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Suspense } from 'react';

import { useOrderTracking } from './hooks/useOrderTracking';
import { TrackForm, OrderResult } from './components';

function OrderTrackingContent() {
  const { t } = useT('tracking');
  const { formData, result, loading, paymentStatus, handleInputChange, trackOrder } = useOrderTracking();

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <div className="text-center py-16 px-4 border-b border-[#E8E8E8]">
        <p className="text-[#9A9A9A] uppercase tracking-[0.2em] text-xs mb-3">{t('subtitle')}</p>
        <h1
          className="text-[#1A1A1A]"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}
        >
          {t('title')}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        {/* Payment status banners */}
        {paymentStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 mb-8 bg-[#F0FBF4] border border-[#B7E4C7]"
          >
            <CheckCircle2 className="size-5 text-[#2D8653] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#1A3A27] text-sm font-medium">Thanh toán thành công!</p>
              <p className="text-[#4A7A5A] text-xs mt-0.5">
                Đơn hàng của bạn đã được xác nhận. Nhập số điện thoại bên dưới để xem chi tiết.
              </p>
            </div>
          </motion.div>
        )}

        {paymentStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 mb-8 bg-[#FFFBEB] border border-[#FDE68A]"
          >
            <Clock className="size-5 text-[#D97706] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#78350F] text-sm font-medium">Đang xử lý thanh toán</p>
              <p className="text-[#92400E] text-xs mt-0.5">
                Giao dịch đang được xác nhận. Vui lòng kiểm tra lại sau ít phút.
              </p>
            </div>
          </motion.div>
        )}

        {paymentStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 mb-8 bg-[#FEF2F2] border border-[#FECACA]"
          >
            <AlertCircle className="size-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#7F1D1D] text-sm font-medium">Thanh toán không thành công</p>
              <p className="text-[#991B1B] text-xs mt-0.5">
                Giao dịch bị từ chối hoặc đã hủy. Vui lòng thử lại hoặc chọn phương thức khác.
              </p>
            </div>
          </motion.div>
        )}

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

export default function OrderTrackingPage() {
  return (
    <Suspense>
      <OrderTrackingContent />
    </Suspense>
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
