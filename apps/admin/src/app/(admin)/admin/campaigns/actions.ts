'use server';

import { revalidatePath } from 'next/cache';
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  uploadCampaignImage,
} from '../../../../services/campaigns.service';
import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from './types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createCampaignAction(
  payload: CreateCampaignPayload,
): Promise<ActionResult<Campaign>> {
  try {
    const campaign = await createCampaign(payload);
    revalidatePath('/admin/campaigns');
    return { success: true, data: campaign };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create campaign',
    };
  }
}

export async function updateCampaignAction(
  id: string,
  payload: UpdateCampaignPayload,
): Promise<ActionResult<Campaign>> {
  try {
    const campaign = await updateCampaign(id, payload);
    revalidatePath('/admin/campaigns');
    return { success: true, data: campaign };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update campaign',
    };
  }
}

export async function deleteCampaignAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteCampaign(id);
    revalidatePath('/admin/campaigns');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete campaign',
    };
  }
}

export async function uploadCampaignImageAction(
  id: string,
  field: 'desktop' | 'mobile',
  formData: FormData,
): Promise<ActionResult<Campaign>> {
  try {
    const file = formData.get('file') as File;
    const campaign = await uploadCampaignImage(id, field, file);
    revalidatePath('/admin/campaigns');
    return { success: true, data: campaign };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to upload image',
    };
  }
}
