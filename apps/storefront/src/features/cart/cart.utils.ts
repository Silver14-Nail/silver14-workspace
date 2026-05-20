import type { ApiCart, ApiCartItem, CartDisplayItem } from './cart.types';

function pickThumbnail(
  images: { url: string; isMain: boolean; sortOrder: number }[] | undefined,
): string | null {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  return (sorted.find((i) => i.isMain) ?? sorted[0])?.url ?? null;
}

export function adaptCartItem(item: ApiCartItem): CartDisplayItem {
  const { variant } = item;
  const { product, shape, size } = variant;

  const computedPrice = parseFloat(variant.computedPrice);
  const basePrice = parseFloat(product.basePrice);
  const salePrice = product.salePrice != null ? parseFloat(product.salePrice) : null;

  // If the product is on sale, apply the discount ratio to the variant's computedPrice
  // computedPrice = basePrice + shape/size adjustments; preserve the same ratio for salePrice
  const effectivePrice =
    salePrice !== null && salePrice < basePrice && basePrice > 0
      ? computedPrice * (salePrice / basePrice)
      : computedPrice;

  const sizeName = size.measurements ? `${size.label} (${size.measurements})` : size.label;

  return {
    id: item.id,
    variantId: variant.id,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug ?? product.id,
    thumbnail: pickThumbnail(product.images),
    shapeName: shape.name,
    sizeName,
    price: effectivePrice,
    basePrice,
    salePrice,
    quantity: item.quantity,
    lineTotal: effectivePrice * item.quantity,
    stockQty: variant.stockQty,
    isCustomSize: item.isCustomSize,
  };
}

export function adaptCart(cart: ApiCart): { id: string; items: CartDisplayItem[] } {
  return {
    id: cart.id,
    items: cart.items.map(adaptCartItem),
  };
}

export function calcCartTotals(items: CartDisplayItem[]) {
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  return { cartCount, subtotal };
}
