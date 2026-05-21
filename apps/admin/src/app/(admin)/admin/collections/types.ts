export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  image: string | null;
  bannerImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CollectionWithProducts extends Collection {
  products: CollectionProduct[];
}

export interface CollectionProduct {
  id: string;
  name: string;
  slug: string | null;
  basePrice: number;
  salePrice: number | null;
  currency: string;
  isActive: boolean;
  images?: { id: string; url: string; isMain: boolean }[];
}

export interface CollectionListResponse {
  data: Collection[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CollectionStats {
  total: number;
  active: number;
  featured: number;
}

export interface CreateCollectionPayload {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  bannerImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateCollectionPayload = Partial<CreateCollectionPayload>;
