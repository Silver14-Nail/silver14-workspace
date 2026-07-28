import { fetchProducts } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';
import { getCollections } from '@/features/collections/collections.api';
import { ProductsPageClient } from './ProductsPageClient';
import type { CollectionFilter } from './hooks/useProductFilters';

const REVALIDATE = { next: { revalidate: 60 } } satisfies RequestInit;
const ALL_COLLECTION: CollectionFilter = { id: 'all', slug: 'all', label: 'All' };
const PAGE_SIZE = 24;

function mapSortToApiParams(sort: string | null, filter: string | null) {
  if (filter === 'new')        return { filterBy: 'new' };
  if (filter === 'bestseller') return { filterBy: 'bestseller' };
  if (sort === 'price-asc')    return { sortBy: 'price_asc' };
  if (sort === 'price-desc')   return { sortBy: 'price_desc' };
  if (sort === 'newest')       return { sortBy: 'newest' };
  if (sort === 'bestseller')   return { filterBy: 'bestseller' };
  return {};
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lng } = await params;
  const sp = await searchParams;

  const search     = typeof sp.search === 'string' ? sp.search : undefined;
  const collection = typeof sp.collection === 'string' ? sp.collection : undefined;
  const sort       = typeof sp.sort === 'string' ? sp.sort : null;
  const filter     = typeof sp.filter === 'string' ? sp.filter : null;
  const apiSort    = mapSortToApiParams(sort, filter);

  // Always fetch page 1 for SSR — client handles further pages via infinite scroll
  const [productsData, collectionsData] = await Promise.all([
    fetchProducts(
      {
        search: search || undefined,
        collection: collection !== 'all' ? collection : undefined,
        limit: PAGE_SIZE,
        page: 1,
        locale: lng,
        ...apiSort,
      },
      REVALIDATE,
    ).catch(() => null),
    getCollections({ limit: 50, locale: lng }).catch(() => null),
  ]);

  const initialProducts  = productsData ? productsData.items.map(adaptListItem) : undefined;
  const initialPagination = productsData?.pagination ?? null;
  const initialCollections: CollectionFilter[] = [
    ALL_COLLECTION,
    ...(collectionsData?.data ?? []).map((c) => ({ id: c.id, slug: c.slug, label: c.name })),
  ];

  return (
    <ProductsPageClient
      lng={lng}
      initialProducts={initialProducts}
      initialPagination={initialPagination}
      initialCollections={initialCollections}
    />
  );
}
