import { createApiClient } from './api-client';
import type {
  Product,
  ProductListResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from '../app/(admin)/admin/products/types';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

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
