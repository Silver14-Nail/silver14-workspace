'use client';

import { useCallback } from 'react';
import { Shield } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { InputField } from '../ui/InputField';
import { BackButton, PayButton } from '../ui/Buttons';
import { PAYMENT_METHODS } from '../../constants';
import type { CardDetails, PaymentMethod } from '../../types';

interface PaymentStepProps {
  payment: PaymentMethod;
  card: CardDetails;
  isProcessing: boolean;
  finalTotal: number;
  onPaymentChange: (method: PaymentMethod) => void;
  onCardUpdate: <K extends keyof CardDetails>(key: K, value: CardDetails[K]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function PaymentStep({
  payment,
  card,
  isProcessing,
  finalTotal,
  onPaymentChange,
  onCardUpdate,
  onBack,
  onSubmit,
}: PaymentStepProps) {
  const { t } = useT('checkout');

  const handleNumber = useCallback((v: string) => onCardUpdate('number', v), [onCardUpdate]);
  const handleName = useCallback((v: string) => onCardUpdate('name', v), [onCardUpdate]);
  const handleExpiry = useCallback((v: string) => onCardUpdate('expiry', v), [onCardUpdate]);
  const handleCvc = useCallback((v: string) => onCardUpdate('cvc', v), [onCardUpdate]);

  return (
    <div className="bg-white p-6 sm:p-8">
      <BackButton label={t('payment.back')} onClick={onBack} />

      <h2
        className="text-[#1A1A1A] mb-6"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.4rem' }}
      >
        {t('payment.title')}
      </h2>

      {/* Method selector */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label={t('payment.methodAriaLabel')}>
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method}
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
              className={`size-4 rounded-full border-2 flex items-center justify-center ${payment === method ? 'border-[#1A1A1A]' : 'border-[#D0D0D0]'}`}
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

      {/* Card details */}
      {payment === 'card' && (
        <div className="space-y-4 p-4 bg-[#F8F8F8] mb-6">
          <InputField
            label={t('payment.card.number')}
            value={card.number}
            onChange={handleNumber}
            placeholder="1234 5678 9012 3456"
            autoComplete="cc-number"
          />
          <InputField
            label={t('payment.card.name')}
            value={card.name}
            onChange={handleName}
            placeholder={t('payment.card.namePlaceholder')}
            autoComplete="cc-name"
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label={t('payment.card.expiry')}
              value={card.expiry}
              onChange={handleExpiry}
              placeholder="MM / YY"
              autoComplete="cc-exp"
            />
            <InputField
              label={t('payment.card.cvc')}
              value={card.cvc}
              onChange={handleCvc}
              placeholder="3 digits"
              autoComplete="cc-csc"
            />
          </div>
        </div>
      )}

      {payment === 'paypal' && (
        <div className="p-4 bg-[#F8F8F8] mb-6 text-center">
          <p className="text-[#9A9A9A] text-sm">{t('payment.paypalHint')}</p>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 text-[#9A9A9A] text-xs mb-6">
        <Shield className="size-3.5 text-[#4A7A5A] flex-shrink-0" aria-hidden />
        <span>{t('payment.securityNote')}</span>
      </div>

      <PayButton
        label={t('payment.cta')}
        processingLabel={t('payment.processing')}
        amount={`$${finalTotal.toFixed(2)}`}
        isProcessing={isProcessing}
        onClick={onSubmit}
      />
    </div>
  );
}
