'use client';

import { Truck, Package } from 'lucide-react';
import { useT } from 'next-i18next/client';

export function TrustBadges() {
  const { t } = useT('product-details');

  const badges = [
    { icon: Truck, labelKey: 'trust.freeShipping' },
    { icon: Package, labelKey: 'trust.handmade' },
  ] as const;

  return (
    <div className="hidden md:grid grid-cols-2 gap-3 py-5 border-y border-[#F0F0F0] mb-6">
      {badges.map(({ icon: Icon, labelKey }) => (
        <div key={labelKey} className="flex flex-col items-center gap-2 text-center">
          <Icon className="size-4 text-[#9A9A9A]" aria-hidden />
          <span className="text-[#7A7A7A] text-[10px] leading-tight">{t(labelKey)}</span>
        </div>
      ))}
    </div>
  );
}
