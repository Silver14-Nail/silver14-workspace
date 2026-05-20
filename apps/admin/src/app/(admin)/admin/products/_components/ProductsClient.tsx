'use client';

import { useState } from 'react';
import ProductsTab from './products/ProductsTab';
import NailSizesTab from './nail-sizes/NailSizesTab';
import NailShapesTab from './nail-shapes/NailShapesTab';
import type { ProductListResponse, ApiNailShape, ApiNailSize } from '../types';

interface ProductsClientProps {
  initialProducts: ProductListResponse;
  initialShapes: ApiNailShape[];
  initialSizes: ApiNailSize[];
  currentPage: number;
  currentSearch: string;
  currentLimit: number;
}

type PageTab = 'products' | 'sizes' | 'shapes';

const TABS: { key: PageTab; label: string }[] = [
  { key: 'products', label: 'Products' },
  { key: 'sizes', label: 'Nail Sizes' },
  { key: 'shapes', label: 'Nail Shapes' },
];

export function ProductsClient({
  initialProducts,
  initialShapes,
  initialSizes,
  currentPage,
  currentSearch,
  currentLimit,
}: ProductsClientProps) {
  const [pageTab, setPageTab] = useState<PageTab>('products');

  return (
    <div className="p-6">
      <div className="flex gap-1 mb-6 border-b border-[#E5E7EB]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setPageTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              pageTab === t.key
                ? 'border-[#111827] text-[#111827]'
                : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {pageTab === 'products' && (
        <ProductsTab
          initialProducts={initialProducts}
          currentPage={currentPage}
          currentSearch={currentSearch}
          currentLimit={currentLimit}
          shapes={initialShapes}
          sizes={initialSizes}
        />
      )}
      {pageTab === 'sizes' && <NailSizesTab initialSizes={initialSizes} />}
      {pageTab === 'shapes' && <NailShapesTab initialShapes={initialShapes} />}
    </div>
  );
}
