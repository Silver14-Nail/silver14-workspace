export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  thumbnail: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  inStock: boolean;
}

export interface StorefrontProductDetail extends StorefrontProduct {
  description: string | null;
  images: string[];
  availableShapes: string[];
  availableSizes: string[];
  processingTime: string;
}
