import { createApiClient } from './api-client';
import type {
  Collection,
  CollectionWithProducts,
  CollectionListResponse,
  CollectionStats,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from '../app/(admin)/admin/collections/types';

export interface CollectionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export async function listCollections(query?: CollectionListQuery): Promise<CollectionListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<CollectionListResponse>('/admin-api/collections', {
    params: query,
  });
  return data;
}

export async function getCollectionStats(): Promise<CollectionStats> {
  const client = await createApiClient();
  const { data } = await client.get<CollectionStats>('/admin-api/collections/stats');
  return data;
}

export async function getCollectionDetail(id: string): Promise<CollectionWithProducts> {
  const client = await createApiClient();
  const { data } = await client.get<CollectionWithProducts>(`/admin-api/collections/${id}`);
  return data;
}

export async function createCollection(payload: CreateCollectionPayload): Promise<Collection> {
  const client = await createApiClient();
  const { data } = await client.post<Collection>('/admin-api/collections', payload);
  return data;
}

export async function updateCollection(
  id: string,
  payload: UpdateCollectionPayload,
): Promise<Collection> {
  const client = await createApiClient();
  const { data } = await client.patch<Collection>(`/admin-api/collections/${id}`, payload);
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/collections/${id}`);
}

export async function activateCollection(id: string): Promise<Collection> {
  const client = await createApiClient();
  const { data } = await client.patch<Collection>(`/admin-api/collections/${id}/activate`);
  return data;
}

export async function deactivateCollection(id: string): Promise<Collection> {
  const client = await createApiClient();
  const { data } = await client.patch<Collection>(`/admin-api/collections/${id}/deactivate`);
  return data;
}

export async function featureCollection(id: string): Promise<Collection> {
  const client = await createApiClient();
  const { data } = await client.patch<Collection>(`/admin-api/collections/${id}/feature`);
  return data;
}

export async function unfeatureCollection(id: string): Promise<Collection> {
  const client = await createApiClient();
  const { data } = await client.patch<Collection>(`/admin-api/collections/${id}/unfeature`);
  return data;
}

export async function assignCollectionProducts(
  id: string,
  productIds: string[],
): Promise<CollectionWithProducts> {
  const client = await createApiClient();
  const { data } = await client.patch<CollectionWithProducts>(
    `/admin-api/collections/${id}/products`,
    { productIds },
  );
  return data;
}
