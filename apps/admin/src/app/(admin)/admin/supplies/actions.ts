'use server';

import { revalidatePath } from 'next/cache';
import { createSupply, updateSupply, deleteSupply } from '../../../../services/products.service';
import type { CreateProductPayload, UpdateProductPayload, Product } from '../products/types';

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
