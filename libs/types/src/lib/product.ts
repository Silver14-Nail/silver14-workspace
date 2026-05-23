export type ProductType = 'nail' | 'supply' | 'accessory' | 'tool';

export interface ProductVariant {
  size: string;
  shape: string;
  length?: string;
  stock: number;
  sku: string;
}

export interface ProductInventory {
  productId: string;
  productName: string;
  productType?: ProductType;
  variants: ProductVariant[];
  totalStock: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface UpdateInventoryRequest {
  productId: string;
  size: string;
  shape: string;
  length?: string;
  stock: number;
}
