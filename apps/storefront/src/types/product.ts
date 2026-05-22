export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  currency: string;
  thumbnail: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  inStock: boolean;
}

/** A single variant with its display labels — used to resolve variantId from selections */
export interface StorefrontVariant {
  id: string;
  /** Matches an entry in availableShapes — use for lookup */
  shapeLabel: string;
  /** Matches an entry in availableSizes — use for lookup */
  sizeLabel: string;
  stockQty: number;
  computedPrice: number;
  isAvailable: boolean;
}

export interface StorefrontProductDetail extends StorefrontProduct {
  description: string | null;
  images: string[];
  availableShapes: string[];
  availableSizes: string[];
  /** Maps shape label → USD price adjustment; only entries with adj > 0 are present */
  shapeAdjustments: Record<string, number>;
  processingTime: string;
  variants: StorefrontVariant[];
}
