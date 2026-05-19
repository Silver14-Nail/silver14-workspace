export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: number | string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}

export interface Pagination {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductListResponse {
  items: Product[];
  pagination: Pagination;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  basePrice: number;
  currency?: string;
  isActive?: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string | null;
  basePrice?: number;
  currency?: string;
  isActive?: boolean;
}
