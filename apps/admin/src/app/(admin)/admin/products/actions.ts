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
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
  setMainProductImage,
  listProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductTranslations,
  upsertProductTranslation,
  regenerateProductTranslations,
  getProductCollections,
  addProductToCollection,
  removeProductFromCollection,
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
  ReorderImagesPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
  ProductTranslation,
  UpsertProductTranslationPayload,
  ProductCollection,
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

export async function uploadProductImageAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult<ApiProductImage>> {
  try {
    const file = formData.get('file') as File;
    const image = await uploadProductImage(productId, file);
    revalidatePath('/admin/products');
    return { success: true, data: image };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to upload image';
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

export async function listProductVariantsAction(
  productId: string,
): Promise<ActionResult<ApiProductVariant[]>> {
  try {
    const data = await listProductVariants(productId);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load variants' };
  }
}

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

// ─── Product Translations ──────────────────────────────────────────────────────

export async function getProductTranslationsAction(
  productId: string,
): Promise<ActionResult<ProductTranslation[]>> {
  try {
    const data = await getProductTranslations(productId);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load translations' };
  }
}

export async function upsertProductTranslationAction(
  productId: string,
  locale: string,
  payload: UpsertProductTranslationPayload,
): Promise<ActionResult<ProductTranslation>> {
  try {
    const data = await upsertProductTranslation(productId, locale, payload);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save translation' };
  }
}

export async function regenerateProductTranslationsAction(
  productId: string,
): Promise<ActionResult<void>> {
  try {
    await regenerateProductTranslations(productId);
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to regenerate translations' };
  }
}

// ─── Product Collections ───────────────────────────────────────────────────────

export async function getProductCollectionsAction(
  productId: string,
): Promise<ActionResult<ProductCollection[]>> {
  try {
    const data = await getProductCollections(productId);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load collections' };
  }
}

export async function addProductToCollectionAction(
  productId: string,
  collectionId: string,
): Promise<ActionResult<void>> {
  try {
    await addProductToCollection(productId, collectionId);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add to collection' };
  }
}

export async function removeProductFromCollectionAction(
  productId: string,
  collectionId: string,
): Promise<ActionResult<void>> {
  try {
    await removeProductFromCollection(productId, collectionId);
    revalidatePath('/admin/products');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove from collection' };
  }
}
