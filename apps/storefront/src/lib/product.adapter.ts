import type { Product } from '@/MOCK_DATAS/products';
import type { ApiProductListItem, ApiProductDetail, ApiShape, ApiVariant } from './products.api';

function shapeLabel(shape: ApiShape, priceOverride: string | null): string {
  const cm = (shape.lengthMm / 10).toFixed(1);
  const adj = parseFloat(priceOverride ?? shape.priceAdjustment ?? '0');
  return `${shape.name} ${cm}cm${adj > 0 ? ` (+ $${adj.toFixed(0)})` : ''}`;
}

function sizeLabel(size: ApiVariant['size']): string {
  return size.measurements ? `${size.label} (${size.measurements})` : size.label;
}

export function adaptListItem(item: ApiProductListItem): Product {
  return {
    id: item.id,
    name: item.name,
    slug: item.id,
    price: parseFloat(item.basePrice),
    images: item.thumbnail ? [item.thumbnail.url] : [],
    category: 'all',
    collection: '',
    description: item.description ?? '',
    material: '',
    inStock: true,
    isNew: false,
    isBestSeller: false,
    availableSizes: [],
    availableShapes: [],
    processingTime: '3-5 business days',
    tags: [],
    rating: 0,
    reviewCount: 0,
  };
}

export function adaptDetail(detail: ApiProductDetail): Product {
  const availableShapes = detail.shapePricings
    .filter((sp) => sp.isEnabled && sp.shape?.isActive)
    .map((sp) => shapeLabel(sp.shape, sp.priceOverride));

  const uniqueSizes = new Map<string, ApiVariant['size']>();
  for (const v of detail.variants) {
    if (!uniqueSizes.has(v.size.id)) uniqueSizes.set(v.size.id, v.size);
  }
  const availableSizes = [...uniqueSizes.values()].map(sizeLabel);
  const inStock = detail.variants.some((v) => v.stockQty > 0);

  return {
    id: detail.id,
    name: detail.name,
    slug: detail.id,
    price: parseFloat(detail.basePrice),
    images: detail.images.map((img) => img.url),
    category: 'all',
    collection: '',
    description: detail.description ?? '',
    material: '',
    inStock,
    isNew: false,
    isBestSeller: false,
    availableSizes,
    availableShapes,
    processingTime: '3-5 business days',
    tags: [],
    rating: 0,
    reviewCount: 0,
  };
}
