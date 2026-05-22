const getBase = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

// ─── Response types (mirror what NestJS returns) ─────────────────────────────

export interface ApiProductImage {
  id: string;
  url: string;
  sortOrder: number;
  isMain: boolean;
}

export interface ApiShape {
  id: string;
  name: string;
  lengthMm: number;
  sizeTier: 'STANDARD' | 'LARGE' | 'XXL';
  priceAdjustment: string;
  adjustmentType: 'FIXED' | 'PERCENTAGE' | null;
  isActive: boolean;
}

export interface ApiSize {
  id: string;
  label: 'XS' | 'S' | 'M' | 'L' | 'CUSTOM';
  sizeCode: string;
  measurements: string | null;
}

export interface ApiShapePricing {
  id: string;
  isEnabled: boolean;
  priceOverride: string | null;
  priceAdjustment: string | null;
  adjustmentType: 'FIXED' | 'PERCENTAGE' | null;
  shape: ApiShape;
}

export interface ApiVariant {
  id: string;
  stockQty: number;
  computedPrice: string;
  isAvailable: boolean;
  shape: Pick<ApiShape, 'id' | 'name' | 'lengthMm' | 'priceAdjustment' | 'isActive'>;
  size: ApiSize;
}

export interface ApiProductListItem {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  basePrice: string;
  salePrice: string | null;
  currency: string;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  discountPercent: number | null;
  thumbnail: ApiProductImage | null;
}

export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  basePrice: string;
  salePrice: string | null;
  currency: string;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  discountPercent: number | null;
  images: ApiProductImage[];
  shapePricings: ApiShapePricing[];
  variants: ApiVariant[];
}

export interface ApiPagination {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiProductListResponse {
  items: ApiProductListItem[];
  pagination: ApiPagination;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  shapeId?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  filterBy?: string;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${getBase()}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText} — ${path}`);
  return res.json() as Promise<T>;
}

export function fetchProducts(params?: ProductQueryParams): Promise<ApiProductListResponse> {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set('page', String(params.page));
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  if (params?.shapeId) qs.set('shapeId', params.shapeId);
  if (params?.collection) qs.set('collection', params.collection);
  if (params?.minPrice !== undefined) qs.set('minPrice', String(params.minPrice));
  if (params?.maxPrice !== undefined) qs.set('maxPrice', String(params.maxPrice));
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  if (params?.filterBy) qs.set('filterBy', params.filterBy);
  const query = qs.toString();
  return get<ApiProductListResponse>(`/client-api/products${query ? `?${query}` : ''}`);
}

export function fetchProduct(id: string): Promise<ApiProductDetail> {
  return get<ApiProductDetail>(`/client-api/products/${id}`);
}

export function fetchProductBySlug(slug: string): Promise<ApiProductDetail> {
  return get<ApiProductDetail>(`/client-api/products/slug/${slug}`);
}

export function fetchShapes(): Promise<ApiShape[]> {
  return get<ApiShape[]>('/client-api/products/shapes');
}

export function fetchSizes(): Promise<ApiSize[]> {
  return get<ApiSize[]>('/client-api/products/sizes');
}
