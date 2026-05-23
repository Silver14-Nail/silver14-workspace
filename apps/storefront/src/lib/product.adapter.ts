import type {
  StorefrontProduct,
  StorefrontProductDetail,
  StorefrontVariant,
} from '@/types/product';
import type { ApiProductListItem, ApiProductDetail, ApiShape, ApiVariant } from './products.api';

function shapeLabel(shape: Pick<ApiShape, 'name' | 'lengthMm'>): string {
  const cm = (shape.lengthMm / 10).toFixed(1);
  return `${shape.name} ${cm}cm`;
}

function sizeLabel(size: ApiVariant['size']): string {
  if (!size) return '';
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
  const base = parseFloat(detail.basePrice);

  // Collect all unique active shapes from variants (always populated)
  const shapeLabelById = new Map<string, string>();
  const shapeAdjById = new Map<string, number>();
  for (const v of detail.variants) {
    const s = v.shape;
    if (!s || shapeLabelById.has(s.id)) continue;
    if (s.isActive === false) continue;
    shapeLabelById.set(s.id, shapeLabel(s));
    const raw = parseFloat(s.priceAdjustment ?? '0');
    shapeAdjById.set(s.id, isNaN(raw) ? 0 : raw);
  }

  // shapePricings can override the price adjustment per product if configured
  for (const sp of detail.shapePricings ?? []) {
    if (sp.isEnabled && sp.shape?.isActive && sp.priceOverride != null) {
      const raw = parseFloat(sp.priceOverride);
      if (!isNaN(raw)) shapeAdjById.set(sp.shape.id, raw);
    }
  }
  // Build size label map: sizeId → display label (from available variants only)
  const sizeLabelById = new Map<string, string>();
  for (const v of detail.variants) {
    if (v.isAvailable && v.size && !sizeLabelById.has(v.size.id)) {
      sizeLabelById.set(v.size.id, sizeLabel(v.size));
    }
  }
  // "Custom" is always offered (made-to-order) — append if not already present from variants
  const sizeValues = [...sizeLabelById.values()].filter((s) => s !== 'Custom');
  const availableSizes = [...sizeValues, 'Custom'];

  // Compute variant price from basePrice + shape adjustment (not the stored computedPrice
  // which may be stale if the shape adjustment was changed after variants were created)
  const variants: StorefrontVariant[] = detail.variants
    .filter((v) => v.isAvailable && v.shape && v.size && shapeLabelById.has(v.shape.id))
    .map((v) => ({
      id: v.id,
      shapeLabel: shapeLabelById.get(v.shape!.id)!,
      sizeLabel: sizeLabelById.get(v.size!.id) ?? sizeLabel(v.size),
      stockQty: v.stockQty,
      computedPrice: base + (shapeAdjById.get(v.shape!.id) ?? 0),
      isAvailable: v.isAvailable,
    }));

  // Only list shapes that have at least one in-stock regular variant.
  // Custom is always shown as an extra option for every visible shape.
  const shapesWithStock = new Set(
    variants.filter((v) => v.stockQty > 0).map((v) => v.shapeLabel),
  );
  const availableShapes = [...shapeLabelById.values()].filter((label) =>
    shapesWithStock.has(label),
  );

  // Map shape label → USD price adjustment (for currency-aware display in components)
  const shapeAdjustments: Record<string, number> = {};
  for (const [shapeId, label] of shapeLabelById) {
    const adj = shapeAdjById.get(shapeId) ?? 0;
    if (adj > 0) shapeAdjustments[label] = adj;
  }

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
    shapeAdjustments,
    processingTime: '3-5 business days',
    variants,
  };
}
