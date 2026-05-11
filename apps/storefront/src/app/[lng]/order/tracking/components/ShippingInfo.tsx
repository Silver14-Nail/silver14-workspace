'use client';

import { useT } from 'next-i18next/client';
import { MockOrder } from '@/context/CartContext';

export default function ShippingInfo({ address }: { address: MockOrder['shippingAddress'] }) {
  const { t } = useT('tracking');

  return (
    <div className="bg-[#F8F8F8] p-4">
      <p className="text-[#1A1A1A] text-xs uppercase tracking-widest mb-3">
        {t('shippingAddress')}
      </p>
      <p className="text-[#5A5A5A] text-sm leading-relaxed">
        {address.firstName} {address.lastName}
        <br />
        {address.address}
        <br />
        {address.postalCode} {address.city}
        <br />
        {address.country}
      </p>
    </div>
  );
}
