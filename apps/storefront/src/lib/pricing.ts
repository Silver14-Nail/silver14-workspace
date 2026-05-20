export interface PricingInfo {
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  isOnSale: boolean;
  discountPercent: number | null;
}

export function getPricingInfo(product: { price: number; salePrice?: number | null }): PricingInfo {
  const salePrice = product.salePrice ?? null;
  const isOnSale = salePrice !== null && salePrice < product.price;
  const effectivePrice = isOnSale ? salePrice! : product.price;
  const discountPercent = isOnSale ? Math.round((1 - salePrice! / product.price) * 100) : null;

  return {
    price: product.price,
    salePrice,
    effectivePrice,
    isOnSale,
    discountPercent,
  };
}
