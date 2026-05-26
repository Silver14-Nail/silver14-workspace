import { getBase } from '@/lib/api-base';

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
  basePrice: string | number;
  salePrice?: string | number | null;
  currency: string;
  isActive: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
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
  locale?: string;
}): Promise<CollectionListResponse> {
  const url = new URL(`${getBase()}/client-api/collections`);
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  const headers: HeadersInit = {};
  if (params?.locale) headers['X-Locale'] = params.locale;

  const res = await fetch(url.toString(), { next: { revalidate: 300 }, headers });
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function getFeaturedCollections(locale?: string): Promise<StorefrontCollection[]> {
  const headers: HeadersInit = {};
  if (locale) headers['X-Locale'] = locale;
  const res = await fetch(`${getBase()}/client-api/collections/featured`, {
    next: { revalidate: 300 },
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch featured collections');
  return res.json();
}

export async function getCollectionBySlug(
  slug: string,
  locale?: string,
): Promise<StorefrontCollection> {
  const headers: HeadersInit = {};
  if (locale) headers['X-Locale'] = locale;
  const res = await fetch(`${getBase()}/client-api/collections/${slug}`, {
    next: { revalidate: 300 },
    headers,
  });
  if (!res.ok) throw new Error(`Collection not found: ${slug}`);
  return res.json();
}

export async function getCollectionProducts(
  slug: string,
  params?: { page?: number; limit?: number; sortBy?: string; locale?: string },
  init?: RequestInit,
): Promise<{ data: StorefrontCollectionProduct[]; meta: { total: number; totalPages: number; page: number; limit: number } }> {
  const url = new URL(`${getBase()}/client-api/collections/${slug}/products`);
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.sortBy) url.searchParams.set('sortBy', params.sortBy);
  const headers: HeadersInit = {};
  if (params?.locale) headers['X-Locale'] = params.locale;

  const res = await fetch(url.toString(), { next: { revalidate: 60 }, ...init, headers });
  if (!res.ok) throw new Error('Failed to fetch collection products');
  return res.json();
}
