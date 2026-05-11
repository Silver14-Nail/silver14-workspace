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
  const checkout = useCheckout();

  const {
    step,
    checkoutType,
    isProcessing,
    orderId,
    contact,
    shipping,
    payment,
    card,
    cartItems,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    isContactValid,
    isShippingValid,
    setStep,
    setCheckoutType,
    setPayment,
    updateContact,
    updateShipping,
    updateCard,
    handlePayment,
  } = checkout;

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-[#1A1A1A]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: '1.5rem',
              letterSpacing: '0.25em',
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
                    checkoutType={checkoutType}
                    isValid={isContactValid}
                    onUpdate={updateContact}
                    onCheckoutTypeChange={setCheckoutType}
                    onNext={() => setStep('shipping')}
                  />
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div key="shipping" {...SLIDE} transition={{ duration: 0.3 }}>
                  <ShippingStep
                    shipping={shipping}
                    isValid={isShippingValid}
                    onUpdate={updateShipping}
                    onBack={() => setStep('contact')}
                    onNext={() => setStep('payment')}
                  />
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" {...SLIDE} transition={{ duration: 0.3 }}>
                  <PaymentStep
                    payment={payment}
                    card={card}
                    isProcessing={isProcessing}
                    finalTotal={finalTotal}
                    onPaymentChange={setPayment}
                    onCardUpdate={updateCard}
                    onBack={() => setStep('shipping')}
                    onSubmit={handlePayment}
                  />
                </motion.div>
              )}

              {step === 'confirmation' && (
                <ConfirmationStep
                  orderId={orderId}
                  firstName={shipping.firstName}
                  email={contact.email}
                  phone={contact.phone}
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
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
