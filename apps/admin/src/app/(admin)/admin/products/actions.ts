'use server';

import { revalidatePath } from 'next/cache';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createNailShape,
  updateNailShape,
  deleteNailShape,
  createNailSize,
  updateNailSize,
  deleteNailSize,
  getProductDetail,
  getPresignedUploadUrl,
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  setMainProductImage,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from '../../../../services/products.service';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ApiNailShape,
  CreateNailShapePayload,
  UpdateNailShapePayload,
  ApiNailSize,
  CreateNailSizePayload,
  UpdateNailSizePayload,
  ApiProductDetail,
  ApiProductImage,
  ApiProductVariant,
  PresignedUrlResponse,
  AddImagePayload,
  ReorderImagesPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
} from './types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

// ─── Products ─────────────────────────────────────────────────────────────────

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

// ─── Nail Shapes ──────────────────────────────────────────────────────────────

export async function createNailShapeAction(
  payload: CreateNailShapePayload,
): Promise<ActionResult<ApiNailShape>> {
  try {
    const shape = await createNailShape(payload);
    revalidatePath('/admin/products');
    return { success: true, data: shape };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create nail shape';
    return { success: false, error: message };
  }
}

export async function updateNailShapeAction(
  id: string,
  payload: UpdateNailShapePayload,
): Promise<ActionResult<ApiNailShape>> {
  try {
    const shape = await updateNailShape(id, payload);
    revalidatePath('/admin/products');
    return { success: true, data: shape };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update nail shape';
    return { success: false, error: message };
  }
}

export async function deleteNailShapeAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteNailShape(id);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete nail shape';
    return { success: false, error: message };
  }
}

// ─── Nail Sizes ───────────────────────────────────────────────────────────────

export async function createNailSizeAction(
  payload: CreateNailSizePayload,
): Promise<ActionResult<ApiNailSize>> {
  try {
    const size = await createNailSize(payload);
    revalidatePath('/admin/products');
    return { success: true, data: size };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create nail size';
    return { success: false, error: message };
  }
}

export async function updateNailSizeAction(
  id: string,
  payload: UpdateNailSizePayload,
): Promise<ActionResult<ApiNailSize>> {
  try {
    const size = await updateNailSize(id, payload);
    revalidatePath('/admin/products');
    return { success: true, data: size };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update nail size';
    return { success: false, error: message };
  }
}

export async function deleteNailSizeAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteNailSize(id);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete nail size';
    return { success: false, error: message };
  }
}

// ─── Product Detail ────────────────────────────────────────────────────────────

export async function getProductDetailAction(id: string): Promise<ActionResult<ApiProductDetail>> {
  try {
    const product = await getProductDetail(id);
    return { success: true, data: product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load product';
    return { success: false, error: message };
  }
}

// ─── Product Images ────────────────────────────────────────────────────────────

export async function getPresignedUrlAction(
  productId: string,
  payload: { filename: string; contentType: string },
): Promise<ActionResult<PresignedUrlResponse>> {
  try {
    const result = await getPresignedUploadUrl(productId, payload);
    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get upload URL';
    return { success: false, error: message };
  }
}

export async function addProductImageAction(
  productId: string,
  payload: AddImagePayload,
): Promise<ActionResult<ApiProductImage>> {
  try {
    const image = await addProductImage(productId, payload);
    revalidatePath('/admin/products');
    return { success: true, data: image };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add image';
    return { success: false, error: message };
  }
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
): Promise<ActionResult<void>> {
  try {
    await deleteProductImage(productId, imageId);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete image';
    return { success: false, error: message };
  }
}

export async function reorderProductImagesAction(
  productId: string,
  payload: ReorderImagesPayload,
): Promise<ActionResult<void>> {
  try {
    await reorderProductImages(productId, payload);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reorder images';
    return { success: false, error: message };
  }
}

export async function setMainProductImageAction(
  productId: string,
  imageId: string,
): Promise<ActionResult<void>> {
  try {
    await setMainProductImage(productId, imageId);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to set main image';
    return { success: false, error: message };
  }
}

// ─── Product Variants ──────────────────────────────────────────────────────────

export async function createVariantAction(
  productId: string,
  payload: CreateVariantPayload,
): Promise<ActionResult<ApiProductVariant>> {
  try {
    const variant = await createProductVariant(productId, payload);
    revalidatePath('/admin/products');
    return { success: true, data: variant };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create variant';
    return { success: false, error: message };
  }
}

export async function updateVariantAction(
  productId: string,
  variantId: string,
  payload: UpdateVariantPayload,
): Promise<ActionResult<ApiProductVariant>> {
  try {
    const variant = await updateProductVariant(productId, variantId, payload);
    revalidatePath('/admin/products');
    return { success: true, data: variant };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update variant';
    return { success: false, error: message };
  }
}

export async function deleteVariantAction(
  productId: string,
  variantId: string,
): Promise<ActionResult<void>> {
  try {
    await deleteProductVariant(productId, variantId);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete variant';
    return { success: false, error: message };
  }
}
