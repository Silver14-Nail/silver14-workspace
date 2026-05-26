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

const STOREFRONT_URL = process.env.STOREFRONT_INTERNAL_URL ?? process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:4200';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? '';

// Bust the storefront's ISR cache for campaign data after any campaign change.
// Best-effort: a failed revalidation should not fail the save action.
async function revalidateStorefront() {
  try {
    await fetch(`${STOREFRONT_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: REVALIDATE_SECRET }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // ignore — storefront may not be running in CI / development
  }
}

async function myMemoryTranslate(text: string, from: string, to: string): Promise<string> {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${from}|${to}`);
  const email = process.env.MYMEMORY_EMAIL;
  if (email) url.searchParams.set('de', email);

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

  const data = (await res.json()) as {
    responseStatus: number;
    responseData: { translatedText: string };
  };
  if (data.responseStatus !== 200) throw new Error(`MyMemory status ${data.responseStatus}`);

  return data.responseData.translatedText;
}

export async function translateContentAction(
  texts: Record<string, string>,
  from: 'en' | 'vi',
  to: 'en' | 'vi',
): Promise<ActionResult<Record<string, string>>> {
  try {
    const entries = Object.entries(texts).filter(([, v]) => v?.trim());
    const translated = await Promise.all(
      entries.map(async ([key, value]) => {
        const result = await myMemoryTranslate(value, from, to);
        return [key, result] as [string, string];
      }),
    );
    return { success: true, data: Object.fromEntries(translated) };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Translation failed',
    };
  }
}

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
    await revalidateStorefront();
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
    await revalidateStorefront();
    return { success: true, data: campaign };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to upload image',
    };
  }
}
