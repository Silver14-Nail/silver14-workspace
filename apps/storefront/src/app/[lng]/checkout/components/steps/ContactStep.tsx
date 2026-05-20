'use client';

import { useCallback } from 'react';
import { useT } from 'next-i18next/client';
import { InputField } from '../ui/InputField';
import { StepButton } from '../ui/Buttons';
import type { ContactDetails } from '../../types';

interface ContactStepProps {
  contact: ContactDetails;
  isValid: boolean;
  isSubmitting: boolean;
  error: string | null;
  onUpdate: <K extends keyof ContactDetails>(key: K, value: ContactDetails[K]) => void;
  onNext: () => void;
}

export function ContactStep({
  contact,
  isValid,
  isSubmitting,
  error,
  onUpdate,
  onNext,
}: ContactStepProps) {
  const { t } = useT('checkout');

  const handleFullName = useCallback((v: string) => onUpdate('fullName', v), [onUpdate]);
  const handleEmail = useCallback((v: string) => onUpdate('email', v), [onUpdate]);
  const handlePhone = useCallback((v: string) => onUpdate('phone', v), [onUpdate]);

  return (
    <div className="bg-white p-6 sm:p-8">
      <h2
        className="text-[#1A1A1A] mb-6"
        style={{ fontWeight: 400, fontSize: '1.4rem' }}
      >
        {t('contact.title')}
      </h2>

      <div className="space-y-4">
        <InputField
          label={t('contact.fullName')}
          value={contact.fullName}
          onChange={handleFullName}
          required
          autoComplete="name"
        />
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
      </div>

      {error && <p className="text-red-600 text-xs mt-4 px-1">{error}</p>}

      <p className="text-[#9A9A9A] text-xs mt-5 p-3 bg-[#F8F8F8]">{t('contact.guestHint')}</p>

      <StepButton
        label={t('contact.cta')}
        disabled={!isValid}
        isLoading={isSubmitting}
        onClick={onNext}
      />
    </div>
  );
}
