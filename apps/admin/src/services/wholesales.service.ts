import { createApiClient } from './api-client';
import type {
  AccountListQuery,
  AccountListResponse,
  EnquiryListQuery,
  EnquiryListResponse,
  NewsletterListResponse,
  WholesaleAccount,
  WholesaleEnquiry,
  WholesaleTier,
  WholesaleStats,
  NewsletterSubscriber,
  UpdateAccountPayload,
  UpdateEnquiryPayload,
  UpdateTierPayload,
  ApproveEnquiryPayload,
  ApproveEnquiryResult,
} from '../app/(admin)/admin/wholesales/types';

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function listAccounts(query?: AccountListQuery): Promise<AccountListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<AccountListResponse>('/admin-api/wholesales/accounts', {
    params: query,
  });
  return data;
}

export async function getAccount(id: string): Promise<WholesaleAccount> {
  const client = await createApiClient();
  const { data } = await client.get<WholesaleAccount>(`/admin-api/wholesales/accounts/${id}`);
  return data;
}

export async function updateAccount(
  id: string,
  payload: UpdateAccountPayload,
): Promise<WholesaleAccount> {
  const client = await createApiClient();
  const { data } = await client.patch<WholesaleAccount>(
    `/admin-api/wholesales/accounts/${id}`,
    payload,
  );
  return data;
}

export async function deleteAccount(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/wholesales/accounts/${id}`);
}

export async function getWholesaleStats(): Promise<WholesaleStats> {
  const client = await createApiClient();
  const { data } = await client.get<WholesaleStats>('/admin-api/wholesales/accounts/stats');
  return data;
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export async function listEnquiries(query?: EnquiryListQuery): Promise<EnquiryListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<EnquiryListResponse>('/admin-api/wholesales/enquiries', {
    params: query,
  });
  return data;
}

export async function getEnquiry(id: string): Promise<WholesaleEnquiry> {
  const client = await createApiClient();
  const { data } = await client.get<WholesaleEnquiry>(`/admin-api/wholesales/enquiries/${id}`);
  return data;
}

export async function updateEnquiry(
  id: string,
  payload: UpdateEnquiryPayload,
): Promise<WholesaleEnquiry> {
  const client = await createApiClient();
  const { data } = await client.patch<WholesaleEnquiry>(
    `/admin-api/wholesales/enquiries/${id}`,
    payload,
  );
  return data;
}

export async function approveEnquiry(
  id: string,
  payload: ApproveEnquiryPayload,
): Promise<ApproveEnquiryResult> {
  const client = await createApiClient();
  const { data } = await client.patch<ApproveEnquiryResult>(
    `/admin-api/wholesales/enquiries/${id}/approve`,
    payload,
  );
  return data;
}

export async function rejectEnquiry(id: string): Promise<WholesaleEnquiry> {
  const client = await createApiClient();
  const { data } = await client.patch<WholesaleEnquiry>(
    `/admin-api/wholesales/enquiries/${id}/reject`,
  );
  return data;
}

// ─── Tiers ────────────────────────────────────────────────────────────────────

export async function listTiers(): Promise<WholesaleTier[]> {
  const client = await createApiClient();
  const { data } = await client.get<WholesaleTier[]>('/admin-api/wholesales/tiers');
  return data;
}

export async function getTier(id: string): Promise<WholesaleTier> {
  const client = await createApiClient();
  const { data } = await client.get<WholesaleTier>(`/admin-api/wholesales/tiers/${id}`);
  return data;
}

export async function updateTier(id: string, payload: UpdateTierPayload): Promise<WholesaleTier> {
  const client = await createApiClient();
  const { data } = await client.patch<WholesaleTier>(`/admin-api/wholesales/tiers/${id}`, payload);
  return data;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function listNewsletterSubscribers(query?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<NewsletterListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<NewsletterListResponse>('/admin-api/wholesales/newsletter', {
    params: query,
  });
  return data;
}

export async function updateNewsletterSubscriber(
  id: string,
  payload: { status: string },
): Promise<NewsletterSubscriber> {
  const client = await createApiClient();
  const { data } = await client.patch<NewsletterSubscriber>(
    `/admin-api/wholesales/newsletter/${id}`,
    payload,
  );
  return data;
}
