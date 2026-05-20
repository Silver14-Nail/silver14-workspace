'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductsTab from './products/ProductsTab';
import NailSizesTab from './nail-sizes/NailSizesTab';
import NailShapesTab from './nail-shapes/NailShapesTab';
import type { ProductListResponse, ApiNailShape, ApiNailSize } from '../types';

export type PageTab = 'products' | 'nail-sizes' | 'nail-shapes';

const TABS: { key: PageTab; label: string }[] = [
  { key: 'products', label: 'Products' },
  { key: 'nail-sizes', label: 'Nail Sizes' },
  { key: 'nail-shapes', label: 'Nail Shapes' },
];

interface ProductsClientProps {
  initialProducts: ProductListResponse;
  initialShapes: ApiNailShape[];
  initialSizes: ApiNailSize[];
  currentPage: number;
  currentSearch: string;
  currentLimit: number;
  initialTab: PageTab;
}

export function ProductsClient({
  initialProducts,
  initialShapes,
  initialSizes,
  currentPage,
  currentSearch,
  currentLimit,
  initialTab,
}: ProductsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<PageTab>(initialTab);

  // Sync tab when server re-renders with new initialTab (browser back/forward)
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (newTab: PageTab) => {
    setTab(newTab);
    router.push(`/admin/products?tab=${newTab}`);
  };

  return (
    <div className="p-6">
      <div className="flex gap-1 mb-6 border-b border-[#E5E7EB]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-[#111827] text-[#111827]'
                : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <ProductsTab
          initialProducts={initialProducts}
          currentPage={currentPage}
          currentSearch={currentSearch}
          currentLimit={currentLimit}
          shapes={initialShapes}
          sizes={initialSizes}
        />
      )}
      {tab === 'nail-sizes' && <NailSizesTab initialSizes={initialSizes} />}
      {tab === 'nail-shapes' && <NailShapesTab initialShapes={initialShapes} />}
    </div>
  );
}
