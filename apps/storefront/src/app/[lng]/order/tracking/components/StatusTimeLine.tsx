'use client';

import { useT } from 'next-i18next/client';
import { TRACKING_STEPS } from '../constants';
import { MockOrder } from '@/context/CartContext';

export default function StatusTimeline({ status }: { status: MockOrder['status'] }) {
  const { t } = useT('tracking');

  const currentIdx = status === 'Delivered' ? 3 : status === 'Shipped' ? 2 : 0;

  return (
    <div className="mt-8">
      <div className="relative">
        <div className="absolute top-5 left-5 right-5 h-px bg-[#E5E5E5] hidden sm:block" />
        <div
          className="absolute top-5 left-5 h-px bg-[#1A1A1A] hidden sm:block transition-all duration-700"
          style={{ width: `${(currentIdx / (TRACKING_STEPS.length - 1)) * 100}%` }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4">
          {TRACKING_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = i <= currentIdx;
            const isCurrent = i === currentIdx;

            return (
              <div
                key={step.key}
                className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-0 sm:text-center"
              >
                <div
                  className={`relative z-10 size-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-white border-2 border-[#E5E5E5] text-[#D0D0D0]'
                  } ${isCurrent ? 'ring-4 ring-[#1A1A1A]/10' : ''}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="sm:mt-3">
                  <p
                    className={`text-xs uppercase tracking-widest ${isDone ? 'text-[#1A1A1A]' : 'text-[#C0C0C0]'}`}
                  >
                    {t(`timeline.${step.key}`)}
                  </p>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-[#6A6A6A]' : 'text-[#B0B0B0]'} hidden sm:block`}
                  >
                    {t(`timelineDesc.${step.key}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
