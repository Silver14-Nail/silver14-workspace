import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import {
  getCollectionBySlug,
  getCollectionProducts,
} from '../../../../features/collections/collections.api';
import type {
  StorefrontCollection,
  StorefrontCollectionProduct,
} from '../../../../features/collections/collections.api';

interface CollectionPageProps {
  params: Promise<{ lng: string; slug: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string }>;
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { lng, slug } = await params;
  const { page: pageStr, sortBy } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  let collection: StorefrontCollection;
  let products: StorefrontCollectionProduct[] = [];
  let totalPages = 1;
  let total = 0;

  try {
    collection = await getCollectionBySlug(slug);
  } catch {
    notFound();
  }

  try {
    const result = await getCollectionProducts(slug, { page, limit: 24, sortBy });
    products = result.data;
    totalPages = result.meta.totalPages;
    total = result.meta.total;
  } catch {
    // show empty state
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'bestseller', label: 'Best Seller' },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Banner */}
      {collection.bannerImage ? (
        <div className="relative h-48 sm:h-64 overflow-hidden bg-[#F8F8F8]">
          <img
            src={collection.bannerImage}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-end p-8">
            <h1 className="text-3xl font-light tracking-wide text-white">{collection.name}</h1>
          </div>
        </div>
      ) : (
        <div className="bg-[#F8F8F8] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4">
              <Link href={`/${lng}`} className="hover:text-[#1A1A1A] transition">Home</Link>
              <ChevronRight className="size-3" />
              <Link href={`/${lng}/collections`} className="hover:text-[#1A1A1A] transition">Collections</Link>
              <ChevronRight className="size-3" />
              <span className="text-[#1A1A1A]">{collection.name}</span>
            </nav>
            <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">{collection.name}</h1>
            {collection.shortDescription && (
              <p className="mt-2 text-sm text-[#9A9A9A] max-w-xl">{collection.shortDescription}</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* With banner, show breadcrumb + description inline */}
        {collection.bannerImage && (
          <div className="mb-8">
            <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-3">
              <Link href={`/${lng}`} className="hover:text-[#1A1A1A] transition">Home</Link>
              <ChevronRight className="size-3" />
              <Link href={`/${lng}/collections`} className="hover:text-[#1A1A1A] transition">Collections</Link>
              <ChevronRight className="size-3" />
              <span className="text-[#1A1A1A]">{collection.name}</span>
            </nav>
            {collection.shortDescription && (
              <p className="text-sm text-[#9A9A9A] max-w-xl">{collection.shortDescription}</p>
            )}
          </div>
        )}

        {/* Sort + count bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-[#9A9A9A]">{total} {total === 1 ? 'product' : 'products'}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9A9A9A]">Sort by</span>
            <div className="flex gap-1">
              {sortOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href={`/${lng}/collections/${slug}?sortBy=${opt.value}&page=1`}
                  className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] border transition ${
                    (sortBy ?? 'newest') === opt.value
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                      : 'border-[#E5E5E5] text-[#5A5A5A] hover:border-[#1A1A1A]'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="size-12 text-[#D1D5DB] mb-4" />
            <p className="text-sm text-[#9A9A9A]">No products in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => {
              const mainImage =
                product.images?.find((i) => i.isMain) ?? product.images?.[0];
              return (
                <Link
                  key={product.id}
                  href={`/${lng}/products/${product.slug}`}
                  className="group block"
                >
                  <div className="aspect-square overflow-hidden bg-[#F8F8F8]">
                    {mainImage ? (
                      <img
                        src={mainImage.url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="size-8 text-[#D1D5DB]" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1A] group-hover:text-[#5A5A5A] transition line-clamp-2">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-[#9A9A9A]">
                      {product.currency} {Number(product.basePrice).toFixed(2)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/${lng}/collections/${slug}?page=${page - 1}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold uppercase tracking-[0.1em] hover:border-[#1A1A1A] transition"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/${lng}/collections/${slug}?page=${p}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] border transition ${
                  p === page
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#E5E5E5] hover:border-[#1A1A1A]'
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={`/${lng}/collections/${slug}?page=${page + 1}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold uppercase tracking-[0.1em] hover:border-[#1A1A1A] transition"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
