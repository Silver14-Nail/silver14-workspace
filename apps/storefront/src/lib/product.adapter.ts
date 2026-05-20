import type {
  StorefrontProduct,
  StorefrontProductDetail,
  StorefrontVariant,
} from '@/types/product';
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
    salePrice: item.salePrice != null ? parseFloat(item.salePrice) : null,
    currency: item.currency,
    thumbnail: item.thumbnail?.url ?? null,
    isNew: item.isNew,
    isBestSeller: item.isBestSeller,
    inStock: true,
  };
}

export function adaptDetail(detail: ApiProductDetail): StorefrontProductDetail {
  // Build shape label map: shapeId → display label
  const shapeLabelById = new Map<string, string>();
  for (const sp of detail.shapePricings) {
    if (sp.isEnabled && sp.shape?.isActive) {
      shapeLabelById.set(sp.shape.id, shapeLabel(sp.shape, sp.priceOverride));
    }
  }
  const availableShapes = [...shapeLabelById.values()];

  // Build size label map: sizeId → display label (from available variants only)
  const sizeLabelById = new Map<string, string>();
  for (const v of detail.variants) {
    if (v.isAvailable && !sizeLabelById.has(v.size.id)) {
      sizeLabelById.set(v.size.id, sizeLabel(v.size));
    }
  }
  const availableSizes = [...sizeLabelById.values()];

  // Build variants with display labels for variantId resolution on the product page
  const variants: StorefrontVariant[] = detail.variants
    .filter((v) => v.isAvailable && shapeLabelById.has(v.shape.id))
    .map((v) => ({
      id: v.id,
      shapeLabel: shapeLabelById.get(v.shape.id)!,
      sizeLabel: sizeLabelById.get(v.size.id) ?? sizeLabel(v.size),
      stockQty: v.stockQty,
      computedPrice: parseFloat(v.computedPrice),
      isAvailable: v.isAvailable,
    }));

  const inStock = detail.variants.some((v) => v.stockQty > 0 && v.isAvailable);

  const orderedImages = [...detail.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const mainImage = orderedImages.find((img) => img.isMain) ?? orderedImages[0];

  return {
    id: detail.id,
    name: detail.name,
    slug: detail.slug ?? detail.id,
    price: parseFloat(detail.basePrice),
    salePrice: detail.salePrice != null ? parseFloat(detail.salePrice) : null,
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
    variants,
  };
}
