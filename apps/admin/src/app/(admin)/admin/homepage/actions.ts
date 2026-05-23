'use server';

import { revalidatePath } from 'next/cache';
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  uploadCampaignImage,
} from '../../../../services/campaigns.service';
import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from '../campaigns/types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function getHomepageCampaignAction(): Promise<Campaign | null> {
  try {
    const res = await listCampaigns({ placement: 'homepage_hero', limit: 1 });
    return res.items[0] ?? null;
  } catch {
    return null;
  }
}

export async function saveHomepageCampaignAction(
  id: string | null,
  payload: CreateCampaignPayload | UpdateCampaignPayload,
): Promise<ActionResult<Campaign>> {
  try {
    const campaign = id
      ? await updateCampaign(id, payload)
      : await createCampaign(payload as CreateCampaignPayload);
    revalidatePath('/admin/homepage');
    revalidatePath('/admin/campaigns');
    return { success: true, data: campaign };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save homepage campaign',
    };
  }
}

export async function uploadHomepageImageAction(
  id: string,
  field: 'desktop' | 'mobile',
  formData: FormData,
): Promise<ActionResult<Campaign>> {
  try {
    const file = formData.get('file') as File;
    const campaign = await uploadCampaignImage(id, field, file);
    revalidatePath('/admin/homepage');
    return { success: true, data: campaign };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to upload image',
    };
  }
}
