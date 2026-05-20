'use client';

import { useCallback } from 'react';
import { useT } from 'next-i18next/client';
import { InputField } from '../ui/InputField';
import { BackButton, StepButton } from '../ui/Buttons';
import { COUNTRIES } from '../../constants';
import type { ShippingDetails } from '../../types';
import type { ShippingMethod } from '@/features/checkout/checkout.types';

interface ShippingStepProps {
  shipping: ShippingDetails;
  shippingMethods: ShippingMethod[];
  selectedMethodId: string;
  isValid: boolean;
  isSubmitting: boolean;
  error: string | null;
  onUpdate: <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) => void;
  onMethodChange: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ShippingStep({
  shipping,
  shippingMethods,
  selectedMethodId,
  isValid,
  isSubmitting,
  error,
  onUpdate,
  onMethodChange,
  onBack,
  onNext,
}: ShippingStepProps) {
  const { t } = useT('checkout');

  const handle = useCallback(
    <K extends keyof ShippingDetails>(key: K) =>
      (value: ShippingDetails[K]) =>
        onUpdate(key, value),
    [onUpdate],
  );

  return (
    <div className="bg-white p-6 sm:p-8">
      <BackButton label={t('shipping.back')} onClick={onBack} />

      <h2
        className="text-[#1A1A1A] mb-6"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.4rem' }}
      >
        {t('shipping.title')}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label={t('shipping.firstName')}
            value={shipping.firstName}
            onChange={handle('firstName')}
            required
            autoComplete="given-name"
          />
          <InputField
            label={t('shipping.lastName')}
            value={shipping.lastName}
            onChange={handle('lastName')}
            required
            autoComplete="family-name"
          />
        </div>

        <InputField
          label={t('shipping.address')}
          value={shipping.address}
          onChange={handle('address')}
          required
          autoComplete="street-address"
        />
        <InputField
          label={t('shipping.apartment')}
          value={shipping.apartment}
          onChange={handle('apartment')}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label={t('shipping.city')}
            value={shipping.city}
            onChange={handle('city')}
            required
            autoComplete="address-level2"
          />
          <InputField
            label={t('shipping.postalCode')}
            value={shipping.postalCode}
            onChange={handle('postalCode')}
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
            <span className="text-[#C0C0C0]" aria-hidden>
              *
            </span>
          </label>
          <select
            value={shipping.country}
            onChange={(e) => onUpdate('country', e.target.value)}
            className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white outline-none focus:border-[#9A9A9A] transition-colors appearance-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Shipping method */}
        {shippingMethods.length > 0 && (
          <div>
            <label
              className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-2"
              style={{ letterSpacing: '0.1em' }}
            >
              {t('shipping.method')}{' '}
              <span className="text-[#C0C0C0]" aria-hidden>
                *
              </span>
            </label>
            <div className="space-y-2" role="radiogroup" aria-label={t('shipping.methodAriaLabel')}>
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
                    onClick={() => onMethodChange(method.id)}
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
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-xs mt-4 px-1">{error}</p>}

      <StepButton
        label={t('shipping.cta')}
        disabled={!isValid}
        isLoading={isSubmitting}
        onClick={onNext}
      />
    </div>
  );
}
