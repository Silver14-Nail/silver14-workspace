import { fetchProducts } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';
import { getCollections } from '@/features/collections/collections.api';
import { ProductsPageClient } from './ProductsPageClient';
import type { CollectionFilter } from './hooks/useProductFilters';

const REVALIDATE = { cache: 'no-store' } satisfies RequestInit;
const ALL_COLLECTION: CollectionFilter = { id: 'all', slug: 'all', label: 'All' };

function mapSortToApiParams(sort: string | null, filter: string | null) {
  if (filter === 'new') return { filterBy: 'new' };
  if (filter === 'bestseller') return { filterBy: 'bestseller' };
  if (sort === 'price-asc') return { sortBy: 'price_asc' };
  if (sort === 'price-desc') return { sortBy: 'price_desc' };
  if (sort === 'newest') return { sortBy: 'newest' };
  if (sort === 'bestseller') return { filterBy: 'bestseller' };
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

  const search = typeof sp.search === 'string' ? sp.search : undefined;
  const collection = typeof sp.collection === 'string' ? sp.collection : undefined;
  const sort = typeof sp.sort === 'string' ? sp.sort : null;
  const filter = typeof sp.filter === 'string' ? sp.filter : null;

  const apiSort = mapSortToApiParams(sort, filter);

  const [productsData, collectionsData] = await Promise.all([
    fetchProducts(
      {
        search: search || undefined,
        collection: collection !== 'all' ? collection : undefined,
        limit: 100,
        locale: lng,
        ...apiSort,
      },
      REVALIDATE,
    ).catch(() => null),
    getCollections({ limit: 50, locale: lng }).catch(() => null),
  ]);

  // Pass undefined (not []) when fetch fails so useProducts knows to retry client-side.
  const initialProducts = productsData ? productsData.items.map(adaptListItem) : undefined;
  const initialCollections: CollectionFilter[] = [
    ALL_COLLECTION,
    ...(collectionsData?.data ?? []).map((c) => ({ id: c.id, slug: c.slug, label: c.name })),
  ];

  return (
    <ProductsPageClient
      lng={lng}
      initialProducts={initialProducts}
      initialCollections={initialCollections}
    />
  );
}
