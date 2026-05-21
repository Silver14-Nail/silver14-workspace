'use server';

import { revalidatePath } from 'next/cache';
import {
  listAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  getWholesaleStats,
  listEnquiries,
  getEnquiry,
  updateEnquiry,
  approveEnquiry,
  rejectEnquiry,
  listTiers,
  getTier,
  updateTier,
  listNewsletterSubscribers,
  updateNewsletterSubscriber,
} from '../../../../services/wholesales.service';
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
} from './types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const REVALIDATE = '/admin/wholesales';

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function listAccountsAction(
  query?: AccountListQuery,
): Promise<ActionResult<AccountListResponse>> {
  try {
    const data = await listAccounts(query);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load accounts',
    };
  }
}

export async function getAccountAction(id: string): Promise<ActionResult<WholesaleAccount>> {
  try {
    const data = await getAccount(id);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load account' };
  }
}

export async function updateAccountAction(
  id: string,
  payload: UpdateAccountPayload,
): Promise<ActionResult<WholesaleAccount>> {
  try {
    const data = await updateAccount(id, payload);
    revalidatePath(REVALIDATE);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update account',
    };
  }
}

export async function deleteAccountAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteAccount(id);
    revalidatePath(REVALIDATE);
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete account',
    };
  }
}

export async function getWholesaleStatsAction(): Promise<ActionResult<WholesaleStats>> {
  try {
    const data = await getWholesaleStats();
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load stats' };
  }
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export async function listEnquiriesAction(
  query?: EnquiryListQuery,
): Promise<ActionResult<EnquiryListResponse>> {
  try {
    const data = await listEnquiries(query);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load enquiries',
    };
  }
}

export async function getEnquiryAction(id: string): Promise<ActionResult<WholesaleEnquiry>> {
  try {
    const data = await getEnquiry(id);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load enquiry',
    };
  }
}

export async function updateEnquiryAction(
  id: string,
  payload: UpdateEnquiryPayload,
): Promise<ActionResult<WholesaleEnquiry>> {
  try {
    const data = await updateEnquiry(id, payload);
    revalidatePath(REVALIDATE);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update enquiry',
    };
  }
}

export async function approveEnquiryAction(
  id: string,
  payload: ApproveEnquiryPayload,
): Promise<ActionResult<ApproveEnquiryResult>> {
  try {
    const data = await approveEnquiry(id, payload);
    revalidatePath(REVALIDATE);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to approve enquiry',
    };
  }
}

export async function rejectEnquiryAction(id: string): Promise<ActionResult<WholesaleEnquiry>> {
  try {
    const data = await rejectEnquiry(id);
    revalidatePath(REVALIDATE);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reject enquiry',
    };
  }
}

// ─── Tiers ────────────────────────────────────────────────────────────────────

export async function listTiersAction(): Promise<ActionResult<WholesaleTier[]>> {
  try {
    const data = await listTiers();
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load tiers' };
  }
}

export async function getTierAction(id: string): Promise<ActionResult<WholesaleTier>> {
  try {
    const data = await getTier(id);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load tier' };
  }
}

export async function updateTierAction(
  id: string,
  payload: UpdateTierPayload,
): Promise<ActionResult<WholesaleTier>> {
  try {
    const data = await updateTier(id, payload);
    revalidatePath(REVALIDATE);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update tier' };
  }
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function listNewsletterAction(query?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ActionResult<NewsletterListResponse>> {
  try {
    const data = await listNewsletterSubscribers(query);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load subscribers',
    };
  }
}

export async function updateNewsletterAction(
  id: string,
  payload: { status: string },
): Promise<ActionResult<NewsletterSubscriber>> {
  try {
    const data = await updateNewsletterSubscriber(id, payload);
    revalidatePath(REVALIDATE);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update subscriber',
    };
  }
}
