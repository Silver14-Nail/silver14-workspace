'use client';

import { LinkBase } from '@/components/shared/LinkBase';
import { AnimatePresence, motion } from 'motion/react';
import { useT } from 'next-i18next/client';
import { useState, useEffect } from 'react';
import { useCheckout } from './hooks/useCheckout';
import { DEFAULT_SHIPPING } from './constants';
import {
  StepIndicator,
  CheckoutSidebar,
  ContactStep,
  ShippingStep,
  PaymentStep,
  ConfirmationStep,
} from './components';

const SLIDE = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function CheckoutPage() {
  const { t } = useT('checkout');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    step,
    session,
    sessionId,
    isSessionLoading,
    isSubmitting,
    error,
    completedOrderId,
    orderPollingDone,
    confirmEmail,
    confirmFirstName,
    confirmPhone,
    contactDefaults,
    selectedMethodId,
    shippingMethods,
    cartItems,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    currency,
    setStep,
    setSelectedMethodId,
    handleContactNext,
    handleShippingNext,
    handlePaymentSuccess,
    handleApplyCoupon,
    handleRemoveCoupon,
  } = useCheckout();

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <LinkBase
            href="/"
            className="text-[#1A1A1A] font-normal text-[1.9rem] tracking-[0.02em] leading-none"
          >
            {t('brand')}
          </LinkBase>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
          {/* ── Step forms ── */}
          <main>
            {mounted && isSessionLoading ? (
              <div className="bg-white p-6 sm:p-8 space-y-4 animate-pulse">
                <div className="h-7 bg-gray-200 rounded w-48" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-11 bg-gray-200 rounded w-36 ml-auto mt-2" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {step === 'contact' && (
                  <motion.div key="contact" {...SLIDE} transition={{ duration: 0.3 }}>
                    <ContactStep
                      defaultValues={contactDefaults}
                      isSubmitting={isSubmitting}
                      error={error}
                      onNext={handleContactNext}
                    />
                  </motion.div>
                )}

                {step === 'shipping' && (
                  <motion.div key="shipping" {...SLIDE} transition={{ duration: 0.3 }}>
                    <ShippingStep
                      defaultValues={DEFAULT_SHIPPING}
                      shippingMethods={shippingMethods}
                      selectedMethodId={selectedMethodId}
                      isSubmitting={isSubmitting}
                      error={error}
                      onMethodChange={setSelectedMethodId}
                      onBack={() => setStep('contact')}
                      onNext={handleShippingNext}
                    />
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div key="payment" {...SLIDE} transition={{ duration: 0.3 }}>
                    {/*
                     * PaymentStep receives only session context + callbacks.
                     * All provider selection, session creation, and renderer
                     * dispatch happens inside PaymentStep via useCheckoutPayment.
                     */}
                    <PaymentStep
                      sessionId={sessionId}
                      finalTotal={finalTotal}
                      currency={currency}
                      onBack={() => setStep('shipping')}
                      onSuccess={handlePaymentSuccess}
                    />
                  </motion.div>
                )}

                {step === 'confirmation' && (
                  <ConfirmationStep
                    orderId={completedOrderId ?? ''}
                    orderPollingDone={orderPollingDone}
                    firstName={confirmFirstName}
                    email={confirmEmail}
                    phone={confirmPhone}
                  />
                )}
              </AnimatePresence>
            )}
          </main>

          {/* ── Sidebar ── */}
          {step !== 'confirmation' && (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <CheckoutSidebar
                items={cartItems}
                subtotal={subtotal}
                discountAmount={discountAmount}
                shippingCost={shippingCost}
                finalTotal={finalTotal}
                currency={currency}
                couponCode={session?.couponCode}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
