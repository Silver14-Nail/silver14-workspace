'use server';

import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, deleteProduct } from '../../../../services/products.service';
import type { CreateProductPayload, Product, UpdateProductPayload } from './types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createProductAction(
  payload: CreateProductPayload,
): Promise<ActionResult<Product>> {
  try {
    const product = await createProduct(payload);
    revalidatePath('/admin/products');
    return { success: true, data: product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return { success: false, error: message };
  }
}

export async function updateProductAction(
  id: string,
  payload: UpdateProductPayload,
): Promise<ActionResult<Product>> {
  try {
    const product = await updateProduct(id, payload);
    revalidatePath('/admin/products');
    return { success: true, data: product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return { success: false, error: message };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteProduct(id);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return { success: false, error: message };
  }
}
