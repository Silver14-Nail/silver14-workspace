import { listSupplies } from '../../../../services/products.service';
import { SuppliesClient } from './SuppliesClient';
import type { ProductListResponse, Pagination } from '../products/types';

const EMPTY_PAGINATION: Pagination = {
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 20,
  totalPages: 0,
  currentPage: 1,
};

export default async function AdminSuppliesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.min(100, Math.max(5, Number(params.limit ?? 20)));
  const search = params.search ?? '';

  const suppliesResult = await listSupplies({
    page,
    limit,
    search: search || undefined,
  }).catch(() => null);

  const supplies: ProductListResponse = suppliesResult ?? {
    items: [],
    pagination: { ...EMPTY_PAGINATION, itemsPerPage: limit, currentPage: page },
  };

  return (
    <SuppliesClient
      initialSupplies={supplies}
      currentPage={page}
      currentSearch={search}
      currentLimit={limit}
    />
  );
}
