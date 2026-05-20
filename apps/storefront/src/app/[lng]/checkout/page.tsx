'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useT } from 'next-i18next/client';
import { useCheckout } from './hooks/useCheckout';
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
  const {
    step,
    session,
    isSubmitting,
    error,
    completedOrderId,
    confirmEmail,
    confirmFirstName,
    confirmPhone,
    contact,
    shipping,
    selectedMethodId,
    paymentMethod,
    shippingMethods,
    cartItems,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    currency,
    isContactValid,
    isShippingValid,
    setStep,
    setPaymentMethod,
    setSelectedMethodId,
    updateContact,
    updateShipping,
    handleContactNext,
    handleShippingNext,
    handleStripeConfirm,
    handlePaypalCreate,
    handlePaypalCapture,
    handleApplyCoupon,
    handleRemoveCoupon,
  } = useCheckout();

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-[#1A1A1A]"
            style={{
              fontWeight: 400,
              fontSize: '1.9rem',
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            {t('brand')}
          </Link>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
          {/* ── Step forms ── */}
          <main>
            <AnimatePresence mode="wait">
              {step === 'contact' && (
                <motion.div key="contact" {...SLIDE} transition={{ duration: 0.3 }}>
                  <ContactStep
                    contact={contact}
                    isValid={isContactValid}
                    isSubmitting={isSubmitting}
                    error={error}
                    onUpdate={updateContact}
                    onNext={handleContactNext}
                  />
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div key="shipping" {...SLIDE} transition={{ duration: 0.3 }}>
                  <ShippingStep
                    shipping={shipping}
                    shippingMethods={shippingMethods}
                    selectedMethodId={selectedMethodId}
                    isValid={isShippingValid}
                    isSubmitting={isSubmitting}
                    error={error}
                    onUpdate={updateShipping}
                    onMethodChange={setSelectedMethodId}
                    onBack={() => setStep('contact')}
                    onNext={handleShippingNext}
                  />
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" {...SLIDE} transition={{ duration: 0.3 }}>
                  <PaymentStep
                    payment={paymentMethod}
                    isSubmitting={isSubmitting}
                    error={error}
                    finalTotal={finalTotal}
                    currency={currency}
                    onPaymentChange={setPaymentMethod}
                    onStripeConfirm={handleStripeConfirm}
                    onPaypalCreate={handlePaypalCreate}
                    onPaypalCapture={handlePaypalCapture}
                    onBack={() => setStep('shipping')}
                  />
                </motion.div>
              )}

              {step === 'confirmation' && (
                <ConfirmationStep
                  orderId={completedOrderId ?? ''}
                  firstName={confirmFirstName}
                  email={confirmEmail}
                  phone={confirmPhone}
                />
              )}
            </AnimatePresence>
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
