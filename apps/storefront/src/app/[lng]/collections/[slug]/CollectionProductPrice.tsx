'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  basePrice: number;
  salePrice?: number | null;
  isOnSale: boolean;
}

export function CollectionProductPrice({ basePrice, salePrice, isOnSale }: Props) {
  const { format } = useCurrency();

  if (isOnSale && salePrice != null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#C0392B]">{format(salePrice)}</span>
        <span className="text-xs text-[#9A9A9A] line-through">{format(basePrice)}</span>
      </div>
    );
  }

  return <span className="text-xs text-[#9A9A9A]">{format(basePrice)}</span>;
}
