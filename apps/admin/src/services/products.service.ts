import { createApiClient, getAuthToken, SERVER_API_BASE } from './api-client';
import type {
  Product,
  ProductListResponse,
  CreateProductPayload,
  UpdateProductPayload,
  ApiNailShape,
  CreateNailShapePayload,
  UpdateNailShapePayload,
  ApiNailSize,
  CreateNailSizePayload,
  UpdateNailSizePayload,
  ApiProductDetail,
  ApiProductImage,
  ApiProductVariant,
  AddImagePayload,
  ReorderImagesPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
  ProductTranslation,
  UpsertProductTranslationPayload,
  ProductCollection,
} from '../app/(admin)/admin/products/types';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listProducts(query?: ProductListQuery): Promise<ProductListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<ProductListResponse>('/admin-api/products', {
    params: query,
  });
  return data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const client = await createApiClient();
  const { data } = await client.post<Product>('/admin-api/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const client = await createApiClient();
  const { data } = await client.patch<Product>(`/admin-api/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/products/${id}`);
}

// ─── Supplies ────────────────────────────────────────────────────────────────

export interface SupplyListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export async function listSupplies(query?: SupplyListQuery): Promise<ProductListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<ProductListResponse>('/admin-api/supplies', {
    params: query,
  });
  return data;
}

export async function createSupply(payload: CreateProductPayload): Promise<Product> {
  const client = await createApiClient();
  const { data } = await client.post<Product>('/admin-api/supplies', payload);
  return data;
}

export async function updateSupply(id: string, payload: UpdateProductPayload): Promise<Product> {
  const client = await createApiClient();
  const { data } = await client.patch<Product>(`/admin-api/supplies/${id}`, payload);
  return data;
}

export async function deleteSupply(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/supplies/${id}`);
}

// ─── Nail Shapes ──────────────────────────────────────────────────────────────

export async function listNailShapes(): Promise<ApiNailShape[]> {
  const client = await createApiClient();
  const { data } = await client.get<ApiNailShape[]>('/admin-api/nail-shapes');
  return data;
}

export async function createNailShape(payload: CreateNailShapePayload): Promise<ApiNailShape> {
  const client = await createApiClient();
  const { data } = await client.post<ApiNailShape>('/admin-api/nail-shapes', payload);
  return data;
}

export async function updateNailShape(
  id: string,
  payload: UpdateNailShapePayload,
): Promise<ApiNailShape> {
  const client = await createApiClient();
  const { data } = await client.patch<ApiNailShape>(`/admin-api/nail-shapes/${id}`, payload);
  return data;
}

export async function deleteNailShape(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/nail-shapes/${id}`);
}

// ─── Nail Sizes ───────────────────────────────────────────────────────────────

export async function listNailSizes(): Promise<ApiNailSize[]> {
  const client = await createApiClient();
  const { data } = await client.get<ApiNailSize[]>('/admin-api/nail-sizes');
  return data;
}

export async function createNailSize(payload: CreateNailSizePayload): Promise<ApiNailSize> {
  const client = await createApiClient();
  const { data } = await client.post<ApiNailSize>('/admin-api/nail-sizes', payload);
  return data;
}

export async function updateNailSize(
  id: string,
  payload: UpdateNailSizePayload,
): Promise<ApiNailSize> {
  const client = await createApiClient();
  const { data } = await client.patch<ApiNailSize>(`/admin-api/nail-sizes/${id}`, payload);
  return data;
}

export async function deleteNailSize(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/nail-sizes/${id}`);
}

// ─── Product Detail ────────────────────────────────────────────────────────────

export async function getProductDetail(id: string): Promise<ApiProductDetail> {
  const client = await createApiClient();
  const { data } = await client.get<ApiProductDetail>(`/admin-api/products/${id}`);
  return data;
}

// ─── Product Images ────────────────────────────────────────────────────────────

export async function uploadProductImage(productId: string, file: File): Promise<ApiProductImage> {
  const token = await getAuthToken();

  // Use native fetch so FormData sets the multipart boundary correctly.
  // axios overrides Content-Type when manually specified, stripping the boundary.
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(
    `${SERVER_API_BASE}/admin-api/products/${productId}/images/upload`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  return res.json() as Promise<ApiProductImage>;
}

export async function getProductImageUploadUrl(
  productId: string,
  contentType: string,
): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
  const client = await createApiClient();
  const { data } = await client.get<{ presignedUrl: string; publicUrl: string; key: string }>(
    `/admin-api/products/${productId}/images/presign`,
    { params: { contentType } },
  );
  return data;
}

export async function addProductImage(
  productId: string,
  payload: AddImagePayload,
): Promise<ApiProductImage> {
  const client = await createApiClient();
  const { data } = await client.post<ApiProductImage>(
    `/admin-api/products/${productId}/images`,
    payload,
  );
  return data;
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/products/${productId}/images/${imageId}`);
}

export async function reorderProductImages(
  productId: string,
  payload: ReorderImagesPayload,
): Promise<void> {
  const client = await createApiClient();
  await client.patch(`/admin-api/products/${productId}/images/reorder`, payload);
}

export async function setMainProductImage(productId: string, imageId: string): Promise<void> {
  const client = await createApiClient();
  await client.patch(`/admin-api/products/${productId}/images/${imageId}/main`, {});
}

// ─── Product Variants ──────────────────────────────────────────────────────────

export async function listProductVariants(productId: string): Promise<ApiProductVariant[]> {
  const client = await createApiClient();
  const { data } = await client.get<ApiProductVariant[]>(
    `/admin-api/products/${productId}/variants`,
  );
  return data;
}

export async function createProductVariant(
  productId: string,
  payload: CreateVariantPayload,
): Promise<ApiProductVariant> {
  const client = await createApiClient();
  const { data } = await client.post<ApiProductVariant>(
    `/admin-api/products/${productId}/variants`,
    payload,
  );
  return data;
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  payload: UpdateVariantPayload,
): Promise<ApiProductVariant> {
  const client = await createApiClient();
  const { data } = await client.patch<ApiProductVariant>(
    `/admin-api/products/${productId}/variants/${variantId}`,
    payload,
  );
  return data;
}

export async function deleteProductVariant(productId: string, variantId: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/products/${productId}/variants/${variantId}`);
}

// ─── Product Translations ──────────────────────────────────────────────────────

export async function getProductTranslations(productId: string): Promise<ProductTranslation[]> {
  const client = await createApiClient();
  const { data } = await client.get<ProductTranslation[]>(
    `/admin-api/products/${productId}/translations`,
  );
  return data;
}

export async function upsertProductTranslation(
  productId: string,
  locale: string,
  payload: UpsertProductTranslationPayload,
): Promise<ProductTranslation> {
  const client = await createApiClient();
  const { data } = await client.put<ProductTranslation>(
    `/admin-api/products/${productId}/translations/${locale}`,
    payload,
  );
  return data;
}

export async function regenerateProductTranslations(productId: string): Promise<void> {
  const client = await createApiClient();
  await client.post(`/admin-api/products/${productId}/translations/regenerate`, {});
}

// ─── Product Collections ──────────────────────────────────────────────────────

export async function getProductCollections(productId: string): Promise<ProductCollection[]> {
  const client = await createApiClient();
  const { data } = await client.get<ProductCollection[]>(
    `/admin-api/products/${productId}/collections`,
  );
  return data;
}

export async function addProductToCollection(
  productId: string,
  collectionId: string,
): Promise<void> {
  const client = await createApiClient();
  await client.post(`/admin-api/products/${productId}/collections/${collectionId}`, {});
}

export async function removeProductFromCollection(
  productId: string,
  collectionId: string,
): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/products/${productId}/collections/${collectionId}`);
}
