'use server';

import { revalidatePath } from 'next/cache';
import {
  listCollections,
  getCollectionStats,
  getCollectionDetail,
  createCollection,
  updateCollection,
  deleteCollection,
  activateCollection,
  deactivateCollection,
  featureCollection,
  unfeatureCollection,
  assignCollectionProducts,
  getCollectionTranslations,
  upsertCollectionTranslation,
  regenerateCollectionTranslations,
} from '../../../../services/collections.service';
import type {
  Collection,
  CollectionWithProducts,
  CollectionListResponse,
  CollectionStats,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  CollectionTranslation,
  UpsertCollectionTranslationPayload,
} from './types';
import type { CollectionListQuery } from '../../../../services/collections.service';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

// ─── List / Stats ─────────────────────────────────────────────────────────────

export async function listCollectionsAction(
  query?: CollectionListQuery,
): Promise<ActionResult<CollectionListResponse>> {
  try {
    const data = await listCollections(query);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load collections' };
  }
}

export async function getCollectionStatsAction(): Promise<ActionResult<CollectionStats>> {
  try {
    const data = await getCollectionStats();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load stats' };
  }
}

export async function getCollectionDetailAction(
  id: string,
): Promise<ActionResult<CollectionWithProducts>> {
  try {
    const data = await getCollectionDetail(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load collection' };
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createCollectionAction(
  payload: CreateCollectionPayload,
): Promise<ActionResult<Collection>> {
  try {
    const data = await createCollection(payload);
    revalidatePath('/admin/collections');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create collection' };
  }
}

export async function updateCollectionAction(
  id: string,
  payload: UpdateCollectionPayload,
): Promise<ActionResult<Collection>> {
  try {
    const data = await updateCollection(id, payload);
    revalidatePath('/admin/collections');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update collection' };
  }
}

export async function deleteCollectionAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteCollection(id);
    revalidatePath('/admin/collections');
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete collection' };
  }
}

export async function activateCollectionAction(id: string): Promise<ActionResult<Collection>> {
  try {
    const data = await activateCollection(id);
    revalidatePath('/admin/collections');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to activate' };
  }
}

export async function deactivateCollectionAction(id: string): Promise<ActionResult<Collection>> {
  try {
    const data = await deactivateCollection(id);
    revalidatePath('/admin/collections');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to deactivate' };
  }
}

export async function featureCollectionAction(id: string): Promise<ActionResult<Collection>> {
  try {
    const data = await featureCollection(id);
    revalidatePath('/admin/collections');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to feature' };
  }
}

export async function unfeatureCollectionAction(id: string): Promise<ActionResult<Collection>> {
  try {
    const data = await unfeatureCollection(id);
    revalidatePath('/admin/collections');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to unfeature' };
  }
}

export async function assignCollectionProductsAction(
  id: string,
  productIds: string[],
): Promise<ActionResult<CollectionWithProducts>> {
  try {
    const data = await assignCollectionProducts(id, productIds);
    revalidatePath('/admin/collections');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to assign products' };
  }
}

// ─── Collection Translations ───────────────────────────────────────────────────

export async function getCollectionTranslationsAction(
  collectionId: string,
): Promise<ActionResult<CollectionTranslation[]>> {
  try {
    const data = await getCollectionTranslations(collectionId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load translations' };
  }
}

export async function upsertCollectionTranslationAction(
  collectionId: string,
  locale: string,
  payload: UpsertCollectionTranslationPayload,
): Promise<ActionResult<CollectionTranslation>> {
  try {
    const data = await upsertCollectionTranslation(collectionId, locale, payload);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save translation' };
  }
}

export async function regenerateCollectionTranslationsAction(
  collectionId: string,
): Promise<ActionResult<void>> {
  try {
    await regenerateCollectionTranslations(collectionId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to regenerate translations' };
  }
}
