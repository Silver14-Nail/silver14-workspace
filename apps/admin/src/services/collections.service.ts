import { createApiClient, SERVER_API_BASE, getAuthToken } from './api-client';
import type {
  Collection,
  CollectionWithProducts,
  CollectionListResponse,
  CollectionStats,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  CollectionTranslation,
  UpsertCollectionTranslationPayload,
} from '../app/(admin)/admin/collections/types';

export interface CollectionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export async function listCollections(
  query?: CollectionListQuery,
): Promise<CollectionListResponse> {
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

// ─── Collection Translations ───────────────────────────────────────────────────

export async function getCollectionTranslations(
  collectionId: string,
): Promise<CollectionTranslation[]> {
  const client = await createApiClient();
  const { data } = await client.get<CollectionTranslation[]>(
    `/admin-api/collections/${collectionId}/translations`,
  );
  return data;
}

export async function upsertCollectionTranslation(
  collectionId: string,
  locale: string,
  payload: UpsertCollectionTranslationPayload,
): Promise<CollectionTranslation> {
  const client = await createApiClient();
  const { data } = await client.put<CollectionTranslation>(
    `/admin-api/collections/${collectionId}/translations/${locale}`,
    payload,
  );
  return data;
}

export async function regenerateCollectionTranslations(collectionId: string): Promise<void> {
  const client = await createApiClient();
  await client.post(`/admin-api/collections/${collectionId}/translations/regenerate`, {});
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export async function uploadCollectionImage(file: File): Promise<{ url: string }> {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${SERVER_API_BASE}/admin-api/collections/upload-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  return res.json() as Promise<{ url: string }>;
}
