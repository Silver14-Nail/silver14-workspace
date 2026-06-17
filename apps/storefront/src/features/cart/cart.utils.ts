import type { ApiCart, ApiCartItem, CartDisplayItem } from './cart.types';

function pickThumbnail(
  images: { url: string; isMain: boolean; sortOrder: number }[] | undefined,
): string | null {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  return (sorted.find((i) => i.isMain) ?? sorted[0])?.url ?? null;
}

export function adaptCartItem(item: ApiCartItem): CartDisplayItem | null {
  const { variant } = item;
  const { product, shape, size } = variant;

  // Product may be null if the underlying product was deleted but the cart item
  // still references the variant. Skip such items instead of crashing.
  if (!product) return null;

  const computedPrice = parseFloat(variant.computedPrice);
  const basePrice = parseFloat(product.basePrice);
  const salePrice = product.salePrice != null ? parseFloat(product.salePrice) : null;
  const adjustment = Math.max(0, computedPrice - basePrice);

  // If the product is on sale, apply the discount ratio to the variant's computedPrice
  // computedPrice = basePrice + shape/size adjustments; preserve the same ratio for salePrice
  const effectivePrice =
    salePrice !== null && salePrice < basePrice && basePrice > 0
      ? computedPrice * (salePrice / basePrice)
      : computedPrice;

  const sizeName = size
    ? size.measurements
      ? `${size.label} (${size.measurements})`
      : size.label
    : '';

  return {
    id: item.id,
    variantId: variant.id,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug ?? product.id,
    thumbnail: pickThumbnail(product.images),
    colorName: variant.colorName ?? null,
    shapeName: shape?.name ?? '',
    sizeName,
    price: effectivePrice,
    basePrice,
    salePrice,
    adjustment,
    quantity: item.quantity,
    lineTotal: effectivePrice * item.quantity,
    stockQty: variant.stockQty,
    isCustomSize: item.isCustomSize,
    customization: item.customMeasurements?.['notes'] ?? null,
  };
}

export function adaptCart(cart: ApiCart): { id: string; items: CartDisplayItem[] } {
  return {
    id: cart.id,
    items: cart.items.map(adaptCartItem).filter(Boolean) as CartDisplayItem[],
  };
}

export function calcCartTotals(items: CartDisplayItem[]) {
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  return { cartCount, subtotal };
}
