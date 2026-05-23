import { createApiClient } from './api-client';
import type {
  Campaign,
  CampaignListResponse,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../app/(admin)/admin/campaigns/types';

export interface CampaignListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  placement?: string;
  type?: string;
}

export async function listCampaigns(query?: CampaignListQuery): Promise<CampaignListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<CampaignListResponse>('/admin-api/marketing/campaigns', {
    params: query,
  });
  return data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const client = await createApiClient();
  const { data } = await client.get<Campaign>(`/admin-api/marketing/campaigns/${id}`);
  return data;
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  const client = await createApiClient();
  const { data } = await client.post<Campaign>('/admin-api/marketing/campaigns', payload);
  return data;
}

export async function updateCampaign(
  id: string,
  payload: UpdateCampaignPayload,
): Promise<Campaign> {
  const client = await createApiClient();
  const { data } = await client.patch<Campaign>(`/admin-api/marketing/campaigns/${id}`, payload);
  return data;
}

export async function deleteCampaign(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/marketing/campaigns/${id}`);
}

export async function uploadCampaignImage(
  id: string,
  field: 'desktop' | 'mobile',
  file: File,
): Promise<Campaign> {
  const client = await createApiClient();
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post<Campaign>(
    `/admin-api/marketing/campaigns/${id}/images/${field}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}
