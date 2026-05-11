'use client';

import { useCallback } from 'react';
import { useT } from 'next-i18next/client';
import { InputField } from '../ui/InputField';
import { StepButton } from '../ui/Buttons';
import type { ContactDetails } from '../../types';

interface ContactStepProps {
  contact: ContactDetails;
  checkoutType: 'guest' | 'registered';
  isValid: boolean;
  onUpdate: <K extends keyof ContactDetails>(key: K, value: ContactDetails[K]) => void;
  onCheckoutTypeChange: (type: 'guest' | 'registered') => void;
  onNext: () => void;
}

export function ContactStep({
  contact,
  checkoutType,
  isValid,
  onUpdate,
  onCheckoutTypeChange,
  onNext,
}: ContactStepProps) {
  const { t } = useT('checkout');

  const showPassword = checkoutType === 'registered' || contact.createAccount;

  // Stable handlers — memoized so InputField memo is effective
  const handleEmail = useCallback((v: string) => onUpdate('email', v), [onUpdate]);
  const handlePhone = useCallback((v: string) => onUpdate('phone', v), [onUpdate]);
  const handlePassword = useCallback((v: string) => onUpdate('password', v), [onUpdate]);

  return (
    <div className="bg-white p-6 sm:p-8">
      <h2
        className="text-[#1A1A1A] mb-6"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.4rem' }}
      >
        {t('contact.title')}
      </h2>

      {/* Guest / Registered toggle */}
      <div className="flex gap-3 mb-8" role="group" aria-label={t('contact.checkoutTypeAriaLabel')}>
        {(['guest', 'registered'] as const).map((type) => (
          <button
            key={type}
            onClick={() => onCheckoutTypeChange(type)}
            aria-pressed={checkoutType === type}
            className={`flex-1 py-3 border text-xs uppercase tracking-widest transition-all ${
              checkoutType === type
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                : 'border-[#E0E0E0] text-[#6A6A6A] hover:border-[#9A9A9A]'
            }`}
            style={{ letterSpacing: '0.1em' }}
          >
            {t(`contact.type.${type}`)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <InputField
          label={t('contact.email')}
          value={contact.email}
          onChange={handleEmail}
          type="email"
          required
          autoComplete="email"
        />
        <InputField
          label={t('contact.phone')}
          value={contact.phone}
          onChange={handlePhone}
          type="tel"
          placeholder="+49 123 456 7890"
          required
          autoComplete="tel"
        />

        {checkoutType === 'guest' && (
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="createAccount"
              checked={contact.createAccount}
              onChange={(e) => onUpdate('createAccount', e.target.checked)}
              className="mt-0.5 accent-[#1A1A1A]"
            />
            <label htmlFor="createAccount" className="text-[#6A6A6A] text-sm cursor-pointer">
              {t('contact.createAccountLabel')}
            </label>
          </div>
        )}

        {showPassword && (
          <InputField
            label={t('contact.password')}
            value={contact.password}
            onChange={handlePassword}
            type="password"
            required
          />
        )}
      </div>

      <p className="text-[#9A9A9A] text-xs mt-5 p-3 bg-[#F8F8F8]">{t('contact.guestHint')}</p>

      <StepButton label={t('contact.cta')} disabled={!isValid} onClick={onNext} />
    </div>
  );
}
