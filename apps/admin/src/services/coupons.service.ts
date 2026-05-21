import { createApiClient } from './api-client';
import type {
  CouponListQuery,
  CouponListResponse,
  CouponDetail,
  CouponStats,
  CouponUsageListResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
  AddRestrictionPayload,
  CouponRestriction,
  CouponWhitelistUser,
} from '../app/(admin)/admin/coupons/types';

export async function listCoupons(query?: CouponListQuery): Promise<CouponListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<CouponListResponse>('/admin-api/coupons', { params: query });
  return data;
}

export async function getCoupon(id: string): Promise<CouponDetail> {
  const client = await createApiClient();
  const { data } = await client.get<CouponDetail>(`/admin-api/coupons/${id}`);
  return data;
}

export async function getCouponStats(): Promise<CouponStats> {
  const client = await createApiClient();
  const { data } = await client.get<CouponStats>('/admin-api/coupons/stats');
  return data;
}

export async function createCoupon(payload: CreateCouponPayload): Promise<CouponDetail> {
  const client = await createApiClient();
  const { data } = await client.post<CouponDetail>('/admin-api/coupons', payload);
  return data;
}

export async function updateCoupon(
  id: string,
  payload: UpdateCouponPayload,
): Promise<CouponDetail> {
  const client = await createApiClient();
  const { data } = await client.patch<CouponDetail>(`/admin-api/coupons/${id}`, payload);
  return data;
}

export async function activateCoupon(id: string): Promise<CouponDetail> {
  const client = await createApiClient();
  const { data } = await client.patch<CouponDetail>(`/admin-api/coupons/${id}/activate`);
  return data;
}

export async function deactivateCoupon(id: string): Promise<CouponDetail> {
  const client = await createApiClient();
  const { data } = await client.patch<CouponDetail>(`/admin-api/coupons/${id}/deactivate`);
  return data;
}

export async function deleteCoupon(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/coupons/${id}`);
}

export async function getCouponUsages(
  id: string,
  page = 1,
  limit = 20,
): Promise<CouponUsageListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<CouponUsageListResponse>(`/admin-api/coupons/${id}/usages`, {
    params: { page, limit },
  });
  return data;
}

export async function addRestriction(
  id: string,
  payload: AddRestrictionPayload,
): Promise<CouponRestriction> {
  const client = await createApiClient();
  const { data } = await client.post<CouponRestriction>(
    `/admin-api/coupons/${id}/restrictions`,
    payload,
  );
  return data;
}

export async function removeRestriction(id: string, restrictionId: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/coupons/${id}/restrictions/${restrictionId}`);
}

export async function addToWhitelist(id: string, userId: string): Promise<CouponWhitelistUser> {
  const client = await createApiClient();
  const { data } = await client.post<CouponWhitelistUser>(`/admin-api/coupons/${id}/whitelist`, {
    userId,
  });
  return data;
}

export async function removeFromWhitelist(id: string, whitelistId: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/coupons/${id}/whitelist/${whitelistId}`);
}
