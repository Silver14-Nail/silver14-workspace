'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useT } from 'next-i18next/client';
import { ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { currencyActions } from '@/store/slices/currency.slice';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_META,
  CURRENCY_COOKIE,
  type CurrencyCode,
} from '@/config/commerce.config';

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

const shippingDestinations = [
  { code: 'unitedStates', fallback: 'United States' },
  { code: 'germany', fallback: 'Germany' },
  { code: 'france', fallback: 'France' },
  { code: 'unitedKingdom', fallback: 'United Kingdom' },
];
const languages = [
  { code: 'vi', fallback: 'Tiếng Việt' },
  { code: 'en', fallback: 'English' },
];

type HeaderPreferencesDropdownProps = {
  align?: 'right' | 'left';
};

export function HeaderPreferencesDropdown({ align = 'right' }: HeaderPreferencesDropdownProps) {
  const { t } = useT('nav');
  const [open, setOpen] = useState(false);
  const [shipTo, setShipTo] = useState(shippingDestinations[0].code);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentCurrencyCode = useAppSelector((s) => s.currency.code) as CurrencyCode;

  const segments = pathname.split('/').filter(Boolean);
  const currentLanguage = segments[0] || 'en';
  const currentLanguageLabel =
    languages.find((l) => l.code === currentLanguage)?.fallback ?? currentLanguage;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const changeLanguage = (nextLanguage: string) => {
    const nextSegments = [...segments];
    if (nextSegments.length === 0) {
      nextSegments.push(nextLanguage);
    } else {
      nextSegments[0] = nextLanguage;
    }
    const query = searchParams.toString();
    router.push(`/${nextSegments.join('/')}${query ? `?${query}` : ''}`);
  };

  const changeCurrency = (code: string) => {
    const validated = code as CurrencyCode;
    dispatch(currencyActions.setCurrency(validated));
    // Persist to cookie so SSR reads the correct currency on next page load
    document.cookie = `${CURRENCY_COOKIE}=${validated}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#5A5A5A] hover:text-[#1A1A1A]"
      >
        <span className="hidden sm:inline">{t('preferences.shipTo')}</span>
        <span>{t(`preferences.destinations.${shipTo}`)}</span>
        <span suppressHydrationWarning>
          / {currentCurrencyCode} / {currentLanguageLabel}
        </span>
        <ChevronDown className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute top-full z-50 mt-3 w-72 border border-[#E5E5E5] bg-white p-4 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                {t('preferences.shipTo')}
              </span>
              <select
                value={shipTo}
                onChange={(e) => setShipTo(e.target.value)}
                className="w-full border border-[#E0E0E0] bg-white px-3 py-2 text-xs uppercase tracking-[0.08em] text-[#1A1A1A] outline-none"
              >
                {shippingDestinations.map((dest) => (
                  <option key={dest.code} value={dest.code}>
                    {t(`preferences.destinations.${dest.code}`, dest.fallback)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                {t('preferences.currency')}
              </span>
              <select
                value={currentCurrencyCode}
                onChange={(e) => changeCurrency(e.target.value)}
                className="w-full border border-[#E0E0E0] bg-white px-3 py-2 text-xs uppercase tracking-[0.08em] text-[#1A1A1A] outline-none"
              >
                {SUPPORTED_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code} — {CURRENCY_META[code].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                {t('preferences.language')}
              </span>
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="w-full border border-[#E0E0E0] bg-white px-3 py-2 text-xs uppercase tracking-[0.08em] text-[#1A1A1A] outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {t(`preferences.languages.${lang.code}`, lang.fallback)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
