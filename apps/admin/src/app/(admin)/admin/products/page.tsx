import { ProductsClient } from './_components/ProductsClient';
import { listProducts, listNailShapes, listNailSizes } from '../../../../services/products.service';
import type { ProductListResponse, ApiNailShape, ApiNailSize, Pagination } from './types';
import type { PageTab } from './_components/ProductsClient';

const EMPTY_PAGINATION: Pagination = {
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 20,
  totalPages: 0,
  currentPage: 1,
};

const VALID_TABS = new Set<string>(['products', 'nail-sizes', 'nail-shapes']);

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; limit?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.min(100, Math.max(5, Number(params.limit ?? 20)));
  const search = params.search ?? '';
  const tab: PageTab = VALID_TABS.has(params.tab ?? '') ? (params.tab as PageTab) : 'products';

  const [productsResult, shapesResult, sizesResult] = await Promise.allSettled([
    listProducts({ page, limit, search: search || undefined, type: 'nail' }),
    listNailShapes(),
    listNailSizes(),
  ]);

  const products: ProductListResponse =
    productsResult.status === 'fulfilled'
      ? productsResult.value
      : { items: [], pagination: { ...EMPTY_PAGINATION, itemsPerPage: limit, currentPage: page } };

  const shapes: ApiNailShape[] = shapesResult.status === 'fulfilled' ? shapesResult.value : [];
  const sizes: ApiNailSize[] = sizesResult.status === 'fulfilled' ? sizesResult.value : [];

  return (
    <ProductsClient
      initialProducts={products}
      initialShapes={shapes}
      initialSizes={sizes}
      currentPage={page}
      currentSearch={search}
      currentLimit={limit}
      initialTab={tab}
    />
  );
}
