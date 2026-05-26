import { LinkBase } from '@/components/shared/LinkBase';
import { Package } from 'lucide-react';
import { getCollections } from '../../../features/collections/collections.api';
import type { StorefrontCollection } from '../../../features/collections/collections.api';

export default async function CollectionsPage() {
  let collections: StorefrontCollection[] = [];
  try {
    const result = await getCollections({ limit: 50 });
    collections = result.data;
  } catch {
    // render empty state if API is unavailable
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Collections</h1>
          <p className="mt-2 text-sm text-[#9A9A9A]">
            Explore our curated nail art collections
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="size-12 text-[#D1D5DB] mb-4" />
            <p className="text-sm text-[#9A9A9A]">No collections available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <LinkBase
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden bg-white">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="size-12 text-[#D1D5DB]" />
                    </div>
                  )}
                  {collection.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1">
                      Featured
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1A1A1A] group-hover:text-[#5A5A5A] transition">
                    {collection.name}
                  </h2>
                  {collection.shortDescription && (
                    <p className="mt-1 text-xs text-[#9A9A9A] line-clamp-2">
                      {collection.shortDescription}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[#9A9A9A]">
                    {collection.productCount} {collection.productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </LinkBase>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
