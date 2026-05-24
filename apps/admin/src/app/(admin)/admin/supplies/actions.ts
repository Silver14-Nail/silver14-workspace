'use server';

import { revalidatePath } from 'next/cache';
import {
  createSupply,
  updateSupply,
  deleteSupply,
  listProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from '../../../../services/products.service';
import type {
  CreateProductPayload,
  UpdateProductPayload,
  Product,
  ApiProductVariant,
  CreateVariantPayload,
  UpdateVariantPayload,
} from '../products/types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createSupplyAction(
  payload: CreateProductPayload,
): Promise<ActionResult<Product>> {
  try {
    const supply = await createSupply(payload);
    revalidatePath('/admin/supplies');
    return { success: true, data: supply };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create supply' };
  }
}

export async function updateSupplyAction(
  id: string,
  payload: UpdateProductPayload,
): Promise<ActionResult<Product>> {
  try {
    const supply = await updateSupply(id, payload);
    revalidatePath('/admin/supplies');
    return { success: true, data: supply };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update supply' };
  }
}

export async function deleteSupplyAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteSupply(id);
    revalidatePath('/admin/supplies');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete supply' };
  }
}

// ─── Supply Variants ───────────────────────────────────────────────────────────

export async function listSupplyVariantsAction(
  supplyId: string,
): Promise<ActionResult<ApiProductVariant[]>> {
  try {
    const data = await listProductVariants(supplyId);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load variants' };
  }
}

export async function createSupplyVariantAction(
  supplyId: string,
  payload: CreateVariantPayload,
): Promise<ActionResult<ApiProductVariant>> {
  try {
    const variant = await createProductVariant(supplyId, payload);
    revalidatePath('/admin/supplies');
    return { success: true, data: variant };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create variant' };
  }
}

export async function updateSupplyVariantAction(
  supplyId: string,
  variantId: string,
  payload: UpdateVariantPayload,
): Promise<ActionResult<ApiProductVariant>> {
  try {
    const variant = await updateProductVariant(supplyId, variantId, payload);
    revalidatePath('/admin/supplies');
    return { success: true, data: variant };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update variant' };
  }
}

export async function deleteSupplyVariantAction(
  supplyId: string,
  variantId: string,
): Promise<ActionResult<void>> {
  try {
    await deleteProductVariant(supplyId, variantId);
    revalidatePath('/admin/supplies');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete variant' };
  }
}
