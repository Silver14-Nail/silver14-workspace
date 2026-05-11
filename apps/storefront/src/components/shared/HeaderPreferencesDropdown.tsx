'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const shippingDestinations = ['United States', 'Germany', 'France', 'United Kingdom'];
const currencies = ['USD'];
const languages = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tieng Viet' },
];

type HeaderPreferencesDropdownProps = {
  align?: 'right' | 'left';
};

export function HeaderPreferencesDropdown({ align = 'right' }: HeaderPreferencesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [shipTo, setShipTo] = useState(shippingDestinations[0]);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const segments = pathname.split('/').filter(Boolean);
  const currentLanguage = segments[0] || 'en';

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

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#5A5A5A] hover:text-[#1A1A1A]"
      >
        <span className="hidden sm:inline">Ship to</span>
        <span>{shipTo}</span>
        <span>/ USD / {currentLanguage.toUpperCase()}</span>
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
                Ship to
              </span>
              <select
                value={shipTo}
                onChange={(event) => setShipTo(event.target.value)}
                className="w-full border border-[#E0E0E0] bg-white px-3 py-2 text-xs uppercase tracking-[0.08em] text-[#1A1A1A] outline-none"
              >
                {shippingDestinations.map((destination) => (
                  <option key={destination} value={destination}>
                    {destination}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                Currency
              </span>
              <select
                defaultValue="USD"
                className="w-full border border-[#E0E0E0] bg-white px-3 py-2 text-xs uppercase tracking-[0.08em] text-[#1A1A1A] outline-none"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                Language
              </span>
              <select
                value={currentLanguage}
                onChange={(event) => changeLanguage(event.target.value)}
                className="w-full border border-[#E0E0E0] bg-white px-3 py-2 text-xs uppercase tracking-[0.08em] text-[#1A1A1A] outline-none"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
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
