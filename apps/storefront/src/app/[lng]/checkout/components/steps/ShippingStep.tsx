'use client';

import { useCallback } from 'react';
import { useT } from 'next-i18next/client';
import { InputField } from '../ui/InputField';
import { BackButton, StepButton } from '../ui/Buttons';
import { COUNTRIES } from '../../constants';
import type { ShippingDetails } from '../../types';

interface ShippingStepProps {
  shipping: ShippingDetails;
  isValid: boolean;
  onUpdate: <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ShippingStep({ shipping, isValid, onUpdate, onBack, onNext }: ShippingStepProps) {
  const { t } = useT('checkout');

  // One stable handler per field — keeps InputField memo intact
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
            required
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

        {/* Notes */}
        <div>
          <label
            className="block text-[#6A6A6A] text-xs uppercase tracking-widest mb-1.5"
            style={{ letterSpacing: '0.1em' }}
          >
            {t('shipping.notes')}
          </label>
          <textarea
            value={shipping.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
            placeholder={t('shipping.notesPlaceholder')}
            rows={3}
            className="w-full border border-[#E0E0E0] px-4 py-3 text-sm text-[#1A1A1A] bg-white placeholder:text-[#B0B0B0] outline-none focus:border-[#9A9A9A] transition-colors resize-none"
          />
        </div>
      </div>

      <StepButton label={t('shipping.cta')} disabled={!isValid} onClick={onNext} />
    </div>
  );
}
