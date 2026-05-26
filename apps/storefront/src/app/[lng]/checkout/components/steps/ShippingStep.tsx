'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useT } from 'next-i18next/client';
import { InputField } from '../ui/InputField';
import { BackButton, StepButton } from '../ui/Buttons';
import { COUNTRIES } from '../../constants';
import { shippingSchema, type ShippingFormData } from '../../schemas';
import type { ShippingMethod } from '@/features/checkout/checkout.types';

interface ShippingStepProps {
  defaultValues: ShippingFormData;
  shippingMethods: ShippingMethod[];
  selectedMethodId: string;
  isSubmitting: boolean;
  error: string | null;
  onMethodChange: (id: string) => void;
  onBack: () => void;
  onNext: (data: ShippingFormData) => Promise<void>;
}

export function ShippingStep({
  defaultValues,
  shippingMethods,
  selectedMethodId,
  isSubmitting,
  error,
  onMethodChange,
  onBack,
  onNext,
}: ShippingStepProps) {
  const { t } = useT('checkout');
  const [methodError, setMethodError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (data) => {
    if (shippingMethods.length > 0 && !selectedMethodId) {
      setMethodError(t('shipping.errors.methodRequired'));
      return;
    }
    setMethodError(null);
    await onNext(data);
  });

  const handleMethodChange = (id: string) => {
    setMethodError(null);
    onMethodChange(id);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="bg-white p-6 sm:p-8">
        <BackButton label={t('shipping.back')} onClick={onBack} />

        <h2
          className="text-[#1A1A1A] mb-6"
          style={{ fontWeight: 400, fontSize: '1.4rem' }}
        >
          {t('shipping.title')}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label={t('shipping.firstName')}
              registration={register('firstName')}
              required
              autoComplete="given-name"
              error={errors.firstName?.message ? t(errors.firstName.message) : undefined}
            />
            <InputField
              label={t('shipping.lastName')}
              registration={register('lastName')}
              required
              autoComplete="family-name"
              error={errors.lastName?.message ? t(errors.lastName.message) : undefined}
            />
          </div>

          <InputField
            label={t('shipping.address')}
            registration={register('address')}
            required
            autoComplete="street-address"
            error={errors.address?.message ? t(errors.address.message) : undefined}
          />
          <InputField
            label={t('shipping.apartment')}
            registration={register('apartment')}
            autoComplete="address-line2"
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label={t('shipping.city')}
              registration={register('city')}
              required
              autoComplete="address-level2"
              error={errors.city?.message ? t(errors.city.message) : undefined}
            />
            <InputField
              label={t('shipping.postalCode')}
              registration={register('postalCode')}
              autoComplete="postal-code"
            />
          </div>

          {/* Country select */}
          <div>
            <label
              className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
              style={{ letterSpacing: '0.1em' }}
            >
              {t('shipping.country')}{' '}
              <span className="text-[#C0C0C0]" aria-hidden>*</span>
            </label>
            <select
              {...register('country')}
              className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#9A9A9A] transition-colors appearance-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Shipping method — outside RHF, manual validation */}
          {shippingMethods.length > 0 && (
            <div>
              <label
                className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-2"
                style={{ letterSpacing: '0.1em' }}
              >
                {t('shipping.method')}{' '}
                <span className="text-[#C0C0C0]" aria-hidden>*</span>
              </label>
              <div
                className="space-y-2"
                role="radiogroup"
                aria-label={t('shipping.methodAriaLabel')}
              >
                {shippingMethods.map((method) => {
                  const selected = selectedMethodId === method.id;
                  const feeLabel =
                    method.fee === 0
                      ? t('shipping.methodsFree')
                      : new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: method.currency,
                        }).format(method.fee);
                  return (
                    <button
                      key={method.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleMethodChange(method.id)}
                      className={`w-full flex items-center justify-between p-3 border transition-all ${
                        selected
                          ? 'border-[#1A1A1A] bg-[#FAFAFA]'
                          : 'border-[#E0E0E0] hover:border-[#C0C0C0]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`size-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-[#1A1A1A]' : 'border-[#D0D0D0]'
                          }`}
                          aria-hidden
                        >
                          {selected && <span className="size-2 rounded-full bg-[#1A1A1A]" />}
                        </span>
                        <div className="text-left">
                          <p className="text-[#1A1A1A] text-sm">{method.name}</p>
                          <p className="text-[#9A9A9A] text-xs">
                            {method.carrier && `${method.carrier} · `}
                            {method.estDaysMin !== null && method.estDaysMax !== null
                              ? t('shipping.delivery', {
                                  min: method.estDaysMin,
                                  max: method.estDaysMax,
                                })
                              : null}
                          </p>
                        </div>
                      </div>
                      <span className="text-[#1A1A1A] text-sm ml-4 flex-shrink-0">{feeLabel}</span>
                    </button>
                  );
                })}
              </div>
              {methodError && (
                <p role="alert" className="mt-1.5 text-[#C0392B] text-xs">
                  {methodError}
                </p>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-xs mt-4 px-1">{error}</p>}

        <StepButton
          label={t('shipping.cta')}
          disabled={isSubmitting || !isValid}
          isLoading={isSubmitting}
        />
      </div>
    </form>
  );
}
