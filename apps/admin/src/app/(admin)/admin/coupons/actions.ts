'use server';

import { revalidatePath } from 'next/cache';
import {
  listCoupons,
  getCoupon,
  getCouponStats,
  createCoupon,
  updateCoupon,
  activateCoupon,
  deactivateCoupon,
  deleteCoupon,
  getCouponUsages,
  addRestriction,
  removeRestriction,
  addToWhitelist,
  removeFromWhitelist,
} from '../../../../services/coupons.service';
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
} from './types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function listCouponsAction(
  query?: CouponListQuery,
): Promise<ActionResult<CouponListResponse>> {
  try {
    const data = await listCoupons(query);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load coupons';
    return { success: false, error: message };
  }
}

export async function getCouponAction(id: string): Promise<ActionResult<CouponDetail>> {
  try {
    const data = await getCoupon(id);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load coupon';
    return { success: false, error: message };
  }
}

export async function getCouponStatsAction(): Promise<ActionResult<CouponStats>> {
  try {
    const data = await getCouponStats();
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load coupon stats';
    return { success: false, error: message };
  }
}

export async function createCouponAction(
  payload: CreateCouponPayload,
): Promise<ActionResult<CouponDetail>> {
  try {
    const data = await createCoupon(payload);
    revalidatePath('/admin/coupons');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create coupon';
    return { success: false, error: message };
  }
}

export async function updateCouponAction(
  id: string,
  payload: UpdateCouponPayload,
): Promise<ActionResult<CouponDetail>> {
  try {
    const data = await updateCoupon(id, payload);
    revalidatePath('/admin/coupons');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update coupon';
    return { success: false, error: message };
  }
}

export async function activateCouponAction(id: string): Promise<ActionResult<CouponDetail>> {
  try {
    const data = await activateCoupon(id);
    revalidatePath('/admin/coupons');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to activate coupon';
    return { success: false, error: message };
  }
}

export async function deactivateCouponAction(id: string): Promise<ActionResult<CouponDetail>> {
  try {
    const data = await deactivateCoupon(id);
    revalidatePath('/admin/coupons');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to deactivate coupon';
    return { success: false, error: message };
  }
}

export async function deleteCouponAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteCoupon(id);
    revalidatePath('/admin/coupons');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete coupon';
    return { success: false, error: message };
  }
}

export async function getCouponUsagesAction(
  id: string,
  page?: number,
  limit?: number,
): Promise<ActionResult<CouponUsageListResponse>> {
  try {
    const data = await getCouponUsages(id, page, limit);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load coupon usages';
    return { success: false, error: message };
  }
}

export async function addRestrictionAction(
  id: string,
  payload: AddRestrictionPayload,
): Promise<ActionResult<CouponRestriction>> {
  try {
    const data = await addRestriction(id, payload);
    revalidatePath('/admin/coupons');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add restriction';
    return { success: false, error: message };
  }
}

export async function removeRestrictionAction(
  id: string,
  restrictionId: string,
): Promise<ActionResult<void>> {
  try {
    await removeRestriction(id, restrictionId);
    revalidatePath('/admin/coupons');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove restriction';
    return { success: false, error: message };
  }
}

export async function addToWhitelistAction(
  id: string,
  userId: string,
): Promise<ActionResult<CouponWhitelistUser>> {
  try {
    const data = await addToWhitelist(id, userId);
    revalidatePath('/admin/coupons');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add user to whitelist';
    return { success: false, error: message };
  }
}

export async function removeFromWhitelistAction(
  id: string,
  whitelistId: string,
): Promise<ActionResult<void>> {
  try {
    await removeFromWhitelist(id, whitelistId);
    revalidatePath('/admin/coupons');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove user from whitelist';
    return { success: false, error: message };
  }
}
