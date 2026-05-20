export interface ApiCartProductImage {
  url: string;
  isMain: boolean;
  sortOrder: number;
}

export interface ApiCartProduct {
  id: string;
  name: string;
  slug: string | null;
  basePrice: string;
  salePrice: string | null;
  currency: string;
  images: ApiCartProductImage[];
}

export interface ApiCartVariant {
  id: string;
  stockQty: number;
  computedPrice: string;
  isAvailable: boolean;
  product: ApiCartProduct;
  shape: { id: string; name: string };
  size: { id: string; label: string; sizeCode: string; measurements: string | null };
}

export interface ApiCartItem {
  id: string;
  quantity: number;
  isCustomSize: boolean;
  customMeasurements: Record<string, string> | null;
  variant: ApiCartVariant;
}

export interface ApiCart {
  id: string;
  status: string;
  expiresAt: string | null;
  items: ApiCartItem[];
}

export interface ApiAddItemResponse {
  cart: ApiCart;
  cartId: string;
}

/** Unified display item used by all cart UI components */
export interface CartDisplayItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  thumbnail: string | null;
  shapeName: string;
  sizeName: string;
  /** Effective unit price (computedPrice, adjusted proportionally if product is on sale) */
  price: number;
  basePrice: number;
  salePrice: number | null;
  quantity: number;
  lineTotal: number;
  stockQty: number;
  isCustomSize: boolean;
}

/** Lightweight snapshot used only in the add-to-cart preview dialog */
export interface CartPreviewItem {
  productName: string;
  thumbnail: string | null;
  shapeName: string;
  sizeName: string;
  price: number;
  quantity: number;
}
