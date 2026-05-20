import type { StorefrontProduct, StorefrontProductDetail } from '@/types/product';
import type { ApiProductListItem, ApiProductDetail, ApiShape, ApiVariant } from './products.api';

function shapeLabel(shape: ApiShape, priceOverride: string | null): string {
  const cm = (shape.lengthMm / 10).toFixed(1);
  const adj = parseFloat(priceOverride ?? shape.priceAdjustment ?? '0');
  return `${shape.name} ${cm}cm${adj > 0 ? ` (+ $${adj.toFixed(0)})` : ''}`;
}

function sizeLabel(size: ApiVariant['size']): string {
  return size.measurements ? `${size.label} (${size.measurements})` : size.label;
}

export function adaptListItem(item: ApiProductListItem): StorefrontProduct {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug ?? item.id,
    price: parseFloat(item.basePrice),
    currency: item.currency,
    thumbnail: item.thumbnail?.url ?? null,
    isNew: item.isNew,
    isBestSeller: item.isBestSeller,
    inStock: true,
  };
}

export function adaptDetail(detail: ApiProductDetail): StorefrontProductDetail {
  const availableShapes = detail.shapePricings
    .filter((sp) => sp.isEnabled && sp.shape?.isActive)
    .map((sp) => shapeLabel(sp.shape, sp.priceOverride));

  const uniqueSizes = new Map<string, ApiVariant['size']>();
  for (const v of detail.variants) {
    if (v.isAvailable && !uniqueSizes.has(v.size.id)) {
      uniqueSizes.set(v.size.id, v.size);
    }
  }
  const availableSizes = [...uniqueSizes.values()].map(sizeLabel);
  const inStock = detail.variants.some((v) => v.stockQty > 0 && v.isAvailable);

  const orderedImages = [...detail.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const mainImage = orderedImages.find((img) => img.isMain) ?? orderedImages[0];

  return {
    id: detail.id,
    name: detail.name,
    slug: detail.slug ?? detail.id,
    price: parseFloat(detail.basePrice),
    currency: detail.currency,
    thumbnail: mainImage?.url ?? null,
    isNew: detail.isNew,
    isBestSeller: detail.isBestSeller,
    inStock,
    description: detail.description,
    images: orderedImages.map((img) => img.url),
    availableShapes,
    availableSizes,
    processingTime: '3-5 business days',
  };
}
