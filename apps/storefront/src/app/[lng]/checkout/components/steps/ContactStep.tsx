'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useT } from 'next-i18next/client';
import { InputField } from '../ui/InputField';
import { StepButton } from '../ui/Buttons';
import { contactSchema, type ContactFormData } from '../../schemas';

interface ContactStepProps {
  defaultValues: ContactFormData;
  sessionId: string | null;
  isSubmitting: boolean;
  error: string | null;
  onNext: (data: ContactFormData) => Promise<void>;
}

export function ContactStep({
  defaultValues,
  sessionId,
  isSubmitting,
  error,
  onNext,
}: ContactStepProps) {
  const { t } = useT('checkout');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: 'onTouched',
  });

  // Reset form when session is restored with pre-filled data
  useEffect(() => {
    reset(defaultValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
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
            registration={register('fullName')}
            required
            autoComplete="name"
            error={errors.fullName?.message ? t(errors.fullName.message) : undefined}
          />
          <InputField
            label={t('contact.email')}
            registration={register('email')}
            type="email"
            required
            autoComplete="email"
            error={errors.email?.message ? t(errors.email.message) : undefined}
          />
          <InputField
            label={t('contact.phone')}
            registration={register('phone')}
            type="tel"
            placeholder="+49 123 456 7890"
            required
            autoComplete="tel"
            error={errors.phone?.message ? t(errors.phone.message) : undefined}
          />
        </div>

        {error && <p className="text-red-600 text-xs mt-4 px-1">{error}</p>}

        <p className="text-[#9A9A9A] text-xs mt-5 p-3 bg-[#F8F8F8]">{t('contact.guestHint')}</p>

        <StepButton
          label={t('contact.cta')}
          disabled={isSubmitting || !isValid}
          isLoading={isSubmitting}
        />
      </div>
    </form>
  );
}
