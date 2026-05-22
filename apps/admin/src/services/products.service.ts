import { createApiClient } from './api-client';
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
} from '../app/(admin)/admin/products/types';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
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

export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<ApiProductImage> {
  const client = await createApiClient();
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post<ApiProductImage>(
    `/admin-api/products/${productId}/images/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
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
