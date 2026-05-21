const getBase = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface StorefrontCollection {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  productCount: number;
}

export interface StorefrontCollectionProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  salePrice?: string | null;
  currency: string;
  isActive: boolean;
  isOnSale?: boolean;
  discountPercent?: number | null;
  thumbnail?: { url: string } | null;
}

export interface CollectionListResponse {
  data: StorefrontCollection[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getCollections(params?: {
  page?: number;
  limit?: number;
}): Promise<CollectionListResponse> {
  const url = new URL(`${getBase()}/client-api/collections`);
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function getFeaturedCollections(): Promise<StorefrontCollection[]> {
  const res = await fetch(`${getBase()}/client-api/collections/featured`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('Failed to fetch featured collections');
  return res.json();
}

export async function getCollectionBySlug(slug: string): Promise<StorefrontCollection> {
  const res = await fetch(`${getBase()}/client-api/collections/${slug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Collection not found: ${slug}`);
  return res.json();
}

export async function getCollectionProducts(
  slug: string,
  params?: { page?: number; limit?: number; sortBy?: string },
): Promise<{ data: StorefrontCollectionProduct[]; meta: { total: number; totalPages: number; page: number; limit: number } }> {
  const url = new URL(`${getBase()}/client-api/collections/${slug}/products`);
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.sortBy) url.searchParams.set('sortBy', params.sortBy);

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch collection products');
  return res.json();
}
