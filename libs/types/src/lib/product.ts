export interface ProductVariant {
  size: string;
  shape: string;
  length: string;
  stock: number;
  sku: string;
}

export interface ProductInventory {
  productId: string;
  productName: string;
  variants: ProductVariant[];
  totalStock: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface UpdateInventoryRequest {
  productId: string;
  size: string;
  shape: string;
  length: string;
  stock: number;
}
