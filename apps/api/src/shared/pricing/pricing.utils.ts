/** Apply sale ratio to computedPrice — mirrors the frontend adaptCartItem logic. */
export function effectiveUnitPrice(variant: {
  computedPrice: number | string;
  product?: { basePrice: number | string; salePrice: number | string | null } | null;
}): number {
  const computed = Number(variant.computedPrice);
  const base = Number(variant.product?.basePrice ?? 0);
  const sale = variant.product?.salePrice != null ? Number(variant.product.salePrice) : null;
  if (sale !== null && sale < base && base > 0) {
    return computed * (sale / base);
  }
  return computed;
}
