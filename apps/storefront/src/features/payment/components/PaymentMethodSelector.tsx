'use client';

import { CreditCard } from 'lucide-react';
import type { PaymentMethodOption, PaymentProviderName } from '../types';

// ── Icon per provider ─────────────────────────────────────────────────────────

function ProviderIcon({ provider: _provider }: { provider: PaymentProviderName }) {
  return <CreditCard className="size-4 text-[#4A7A5A] flex-shrink-0" aria-hidden />;
}

// ── Badge chip ────────────────────────────────────────────────────────────────

function Badge({ label }: { label: string }) {
  return (
    <span className="text-[9px] border border-[#E0E0E0] px-1.5 py-0.5 text-[#9A9A9A] bg-white leading-none select-none">
      {label}
    </span>
  );
}

// ── Provider label ────────────────────────────────────────────────────────────

const PROVIDER_TAG: Partial<Record<PaymentProviderName, string>> = {
  airwallex: 'Airwallex',
};

// ── Section header ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="text-[#9A9A9A] text-[10px] uppercase tracking-[0.15em] mb-2 mt-4 first:mt-0"
      style={{ letterSpacing: '0.15em' }}
    >
      {label}
    </p>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PaymentMethodSelectorProps {
  options: PaymentMethodOption[];
  selected: string | null; // option.id
  onChange: (option: PaymentMethodOption) => void;
  disabled?: boolean;
  /** Optionally group options by a label. Map of groupLabel → option ids. */
  groups?: { label: string; ids: string[] }[];
}

/**
 * Accessible radio-group for choosing a payment method.
 *
 * Accepts an arbitrary list of PaymentMethodOption objects so new providers
 * can be added purely through configuration — no JSX changes needed here.
 *
 * Supports optional visual grouping via the `groups` prop.
 */
export function PaymentMethodSelector({
  options,
  selected,
  onChange,
  disabled = false,
  groups,
}: PaymentMethodSelectorProps) {
  // If groups are provided, render them in sections.
  // Otherwise render a flat list.
  const renderOption = (opt: PaymentMethodOption) => {
    const isSelected = selected === opt.id;

    return (
      <button
        key={opt.id}
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={disabled}
        onClick={() => onChange(opt)}
        className={[
          'w-full flex items-center gap-3 px-4 py-3.5 border transition-all text-left',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1A1A1A]',
          isSelected
            ? 'border-[#1A1A1A] bg-[#FAFAFA]'
            : 'border-[#E0E0E0] hover:border-[#C0C0C0]',
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Radio dot */}
        <span
          className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            isSelected ? 'border-[#1A1A1A]' : 'border-[#D0D0D0]'
          }`}
          aria-hidden
        >
          {isSelected && <span className="size-2 rounded-full bg-[#1A1A1A]" />}
        </span>

        {/* Provider icon */}
        <ProviderIcon provider={opt.provider} />

        {/* Labels */}
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-[#1A1A1A] text-sm leading-tight">
              {opt.label}
            </span>
            {PROVIDER_TAG[opt.provider] && (
              <span className="text-[9px] text-[#9A9A9A] border border-[#E0E0E0] px-1.5 py-0.5 leading-none hidden sm:inline">
                {PROVIDER_TAG[opt.provider]}
              </span>
            )}
          </span>
          <span className="block text-[#9A9A9A] text-[11px] mt-0.5 leading-tight">
            {opt.description}
          </span>
        </span>

        {/* Card brand badges */}
        <span className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
          {opt.badges.map((b) => (
            <Badge key={b} label={b} />
          ))}
        </span>
      </button>
    );
  };

  if (groups && groups.length > 0) {
    const optionMap = Object.fromEntries(options.map((o) => [o.id, o]));
    return (
      <div role="radiogroup" aria-label="Payment method" className="space-y-1">
        {groups.map(({ label, ids }) => {
          const visible = ids.map((id) => optionMap[id]).filter(Boolean);
          if (!visible.length) return null;
          return (
            <div key={label}>
              <SectionLabel label={label} />
              <div className="space-y-1.5">{visible.map(renderOption)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label="Payment method" className="space-y-2">
      {options.map(renderOption)}
    </div>
  );
}
