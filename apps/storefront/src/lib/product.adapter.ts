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

  // Collect all unique active shapes from variants, tracking sortOrder for sorting
  const shapeLabelById = new Map<string, string>();
  const shapeAdjById = new Map<string, number>();
  const shapeSortById = new Map<string, number>();
  for (const v of detail.variants) {
    const s = v.shape;
    if (!s || shapeLabelById.has(s.id)) continue;
    if (s.isActive === false) continue;
    shapeLabelById.set(s.id, shapeLabel(s));
    const raw = parseFloat(s.priceAdjustment ?? '0');
    shapeAdjById.set(s.id, isNaN(raw) ? 0 : raw);
    shapeSortById.set(s.id, s.sortOrder ?? 999);
  }

  // shapePricings can override the price adjustment per product if configured
  for (const sp of detail.shapePricings ?? []) {
    if (sp.isEnabled && sp.shape?.isActive && sp.priceOverride != null) {
      const raw = parseFloat(sp.priceOverride);
      if (!isNaN(raw)) shapeAdjById.set(sp.shape.id, raw);
    }
  }

  // Build size label map: sizeId → { label, sortOrder } (from all variants)
  const sizeById = new Map<string, { label: string; sortOrder: number }>();
  for (const v of detail.variants) {
    if (v.size && !sizeById.has(v.size.id)) {
      sizeById.set(v.size.id, {
        label: sizeLabel(v.size),
        sortOrder: v.size.sortOrder ?? 999,
      });
    }
  }
  const sizeLabelById = new Map<string, string>(
    [...sizeById.entries()].map(([id, s]) => [id, s.label]),
  );

  // Sizes sorted by sortOrder; "Custom" is always last (made-to-order)
  const sortedSizes = [...sizeById.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  const availableSizes = [...sortedSizes.map((s) => s.label), 'Custom'];

  // All variants with a shape and size
  const variants: StorefrontVariant[] = detail.variants
    .filter((v) => v.shape && v.size && shapeLabelById.has(v.shape.id))
    .map((v) => ({
      id: v.id,
      shapeLabel: shapeLabelById.get(v.shape!.id)!,
      sizeLabel: sizeLabelById.get(v.size!.id) ?? sizeLabel(v.size),
      stockQty: v.stockQty,
      computedPrice: base + (shapeAdjById.get(v.shape!.id) ?? 0),
      isAvailable: v.isAvailable,
    }));

  // All active shapes sorted by sortOrder
  const availableShapes = [...shapeLabelById.entries()]
    .sort(([aId], [bId]) => (shapeSortById.get(aId) ?? 999) - (shapeSortById.get(bId) ?? 999))
    .map(([, label]) => label);

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
