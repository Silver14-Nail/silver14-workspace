'use client';

import { Check } from 'lucide-react';
import { useT } from 'next-i18next/client';
import { CHECKOUT_STEPS } from '../constants';
import type { Step } from '../types';

interface StepIndicatorProps {
  current: Step;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const { t } = useT('checkout');

  if (current === 'confirmation') return null;

  const currentIdx = CHECKOUT_STEPS.findIndex((s) => s.key === current);

  return (
    <nav
      aria-label={t('stepIndicator.ariaLabel')}
      className="flex items-center justify-center gap-0 mb-10"
    >
      {CHECKOUT_STEPS.map(({ key, labelKey }, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const isPending = i > currentIdx;

        return (
          <div key={key} className="flex items-center">
            <div
              className={`flex flex-col items-center gap-1.5 ${isPending ? 'opacity-30' : 'opacity-100'}`}
            >
              <div
                className={`size-7 rounded-full flex items-center justify-center border text-xs transition-all
                  ${isDone ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : ''}
                  ${isActive ? 'border-[#1A1A1A] bg-white text-[#1A1A1A]' : ''}
                  ${isPending ? 'border-[#D0D0D0] text-[#9A9A9A]' : ''}
                `}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? <Check className="size-3" aria-hidden /> : i + 1}
              </div>
              <span
                className="text-[10px] uppercase tracking-widest text-[#6A6A6A]"
                style={{ letterSpacing: '0.1em' }}
              >
                {t(labelKey)}
              </span>
            </div>

            {i < CHECKOUT_STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-px mx-1 mb-5 ${isDone ? 'bg-[#1A1A1A]' : 'bg-[#E0E0E0]'}`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
