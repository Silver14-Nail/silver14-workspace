'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Shield } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { BackButton, PayButton } from '../ui/Buttons';
import { PAYMENT_METHODS } from '../../constants';
import type { PaymentMethod } from '../../types';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';

// Initialised once at module level — never recreated on re-render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#1A1A1A',
      '::placeholder': { color: '#B0B0B0' },
    },
    invalid: { color: '#E53E3E' },
  },
};

// ── Stripe card sub-form (must live inside <Elements>) ────────────────────────

interface StripeCardFormProps {
  isSubmitting: boolean;
  error: string | null;
  finalTotal: number;
  currency: string;
  onConfirm: (stripe: Stripe, cardElement: StripeCardElement) => Promise<void>;
}

function StripeCardForm({
  isSubmitting,
  error,
  finalTotal,
  currency,
  onConfirm,
}: StripeCardFormProps) {
  const { t } = useT('checkout');
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    await onConfirm(stripe, cardElement);
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(finalTotal);

  return (
    <>
      <p className="text-[#9A9A9A] text-xs mb-3">{t('payment.cardHint')}</p>
      <div className="p-4 border border-[#E0E0E0] bg-[#FAFAFA] mb-4">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && <p className="text-red-600 text-xs mb-4 px-1">{error}</p>}

      <SecurityNote />

      <PayButton
        label={t('payment.cta')}
        processingLabel={t('payment.processing')}
        amount={formattedAmount}
        isProcessing={isSubmitting}
        onClick={handlePay}
      />
    </>
  );
}

// ── Shared security note ──────────────────────────────────────────────────────

function SecurityNote() {
  const { t } = useT('checkout');
  return (
    <div className="flex items-center gap-2 text-[#9A9A9A] text-xs mb-6">
      <Shield className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
      <span>{t('payment.securityNote')}</span>
    </div>
  );
}

// ── PaymentStep ───────────────────────────────────────────────────────────────

interface PaymentStepProps {
  payment: PaymentMethod;
  isSubmitting: boolean;
  error: string | null;
  finalTotal: number;
  currency: string;
  onPaymentChange: (method: PaymentMethod) => void;
  onStripeConfirm: (stripe: Stripe, cardElement: StripeCardElement) => Promise<void>;
  onPaypalCreate: () => Promise<string>;
  onPaypalCapture: (paypalOrderId: string) => Promise<void>;
  onBack: () => void;
}

export function PaymentStep({
  payment,
  isSubmitting,
  error,
  finalTotal,
  currency,
  onPaymentChange,
  onStripeConfirm,
  onPaypalCreate,
  onPaypalCapture,
  onBack,
}: PaymentStepProps) {
  const { t } = useT('checkout');
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';

  return (
    <div className="bg-white p-6 sm:p-8">
      <BackButton label={t('payment.back')} onClick={onBack} />

      <h2 className="text-[#1A1A1A] mb-6" style={{ fontWeight: 400, fontSize: '1.4rem' }}>
        {t('payment.title')}
      </h2>

      {/* Method selector */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label={t('payment.methodAriaLabel')}>
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={payment === method}
            onClick={() => onPaymentChange(method)}
            className={`w-full flex items-center gap-4 p-4 border transition-all ${
              payment === method
                ? 'border-[#1A1A1A] bg-[#FAFAFA]'
                : 'border-[#E0E0E0] hover:border-[#C0C0C0]'
            }`}
          >
            <span
              className={`size-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                payment === method ? 'border-[#1A1A1A]' : 'border-[#D0D0D0]'
              }`}
              aria-hidden
            >
              {payment === method && <span className="size-2 rounded-full bg-[#1A1A1A]" />}
            </span>
            <span className="text-left">
              <span className="block text-[#1A1A1A] text-sm">
                {t(`payment.methods.${method}.label`)}
              </span>
              <span className="block text-[#9A9A9A] text-xs">
                {t(`payment.methods.${method}.description`)}
              </span>
            </span>
            <span className="ml-auto flex gap-1.5">
              {method === 'card' &&
                ['VISA', 'MC'].map((b) => (
                  <span
                    key={b}
                    className="text-[10px] border border-[#E0E0E0] px-1.5 py-0.5 text-[#6A6A6A]"
                  >
                    {b}
                  </span>
                ))}
              {method === 'paypal' && (
                <span className="text-[10px] border border-[#E0E0E0] px-1.5 py-0.5 text-[#0070ba]">
                  PayPal
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Stripe card form */}
      {payment === 'card' && (
        <Elements stripe={stripePromise}>
          <StripeCardForm
            isSubmitting={isSubmitting}
            error={error}
            finalTotal={finalTotal}
            currency={currency}
            onConfirm={onStripeConfirm}
          />
        </Elements>
      )}

      {/* PayPal */}
      {payment === 'paypal' && (
        <PayPalScriptProvider
          options={{
            clientId: paypalClientId,
            currency: currency || 'USD',
            intent: 'capture',
          }}
        >
          <div className="mb-4">
            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 py-4 text-[#6A6A6A] text-sm">
                <span
                  className="size-4 border-2 border-[#D0D0D0] border-t-[#1A1A1A] rounded-full animate-spin"
                  aria-hidden
                />
                {t('payment.processing')}
              </div>
            )}
            {!isSubmitting && (
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', color: 'black', label: 'pay' }}
                createOrder={onPaypalCreate}
                onApprove={async (data) => {
                  await onPaypalCapture(data.orderID);
                }}
              />
            )}
            {error && <p className="text-red-600 text-xs mt-3 px-1">{error}</p>}
          </div>
          <SecurityNote />
        </PayPalScriptProvider>
      )}
    </div>
  );
}
