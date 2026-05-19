import { listProducts } from '../../../../services/products.service';
import { ProductsClient } from './ProductsClient';
import type { ProductListResponse } from './types';

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

const EMPTY_DATA: ProductListResponse = {
  items: [],
  pagination: { totalItems: 0, itemCount: 0, itemsPerPage: 20, totalPages: 0, currentPage: 1 },
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search || undefined;
  const isActive =
    params.status === 'active' ? true : params.status === 'inactive' ? false : undefined;

  let data: ProductListResponse = EMPTY_DATA;

  try {
    data = await listProducts({ page, limit: 20, search, isActive });
  } catch {
    // show empty state on error
  }

  return (
    <ProductsClient
      data={data}
      currentSearch={params.search}
      currentStatus={params.status}
      currentPage={page}
    />
  );
}
