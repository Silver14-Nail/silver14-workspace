import { getT } from 'next-i18next/server';
import { fetchProducts } from '@/lib/products.api';
import { adaptListItem } from '@/lib/product.adapter';
import { ProductCard } from '@/components/shared/ProductCard';
import { LinkBase } from '@/components/shared/LinkBase';

const REVALIDATE = { next: { revalidate: 120 } } satisfies RequestInit;

export function HomeSectionsSkeleton() {
  return (
    <>
      {[0, 1].map((i) => (
        <section key={i} className="py-20 max-w-7xl mx-auto px-4">
          <div className="flex justify-between mb-12">
            <div>
              <div className="h-3 bg-[#F0F0F0] animate-pulse rounded w-24 mb-3" />
              <div className="h-8 bg-[#F0F0F0] animate-pulse rounded w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="animate-pulse">
                <div className="bg-[#F0F0F0] aspect-square mb-4" />
                <div className="h-4 bg-[#F0F0F0] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export async function HomeProductSections({ lng }: { lng: string }) {
  const { t } = await getT('home');

  const [newArrivalsData, bestSellersData] = await Promise.all([
    fetchProducts({ filterBy: 'new', limit: 4, locale: lng }, REVALIDATE).catch(() => null),
    fetchProducts({ filterBy: 'bestseller', limit: 4, locale: lng }, REVALIDATE).catch(() => null),
  ]);

  const newArrivals = (newArrivalsData?.items ?? []).map(adaptListItem);
  const bestSellers = (bestSellersData?.items ?? []).map(adaptListItem);

  const viewAll = t('sections.viewAll');
  const comingSoon = t('sections.comingSoon');

  return (
    <>
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-12">
          <div>
            <p className="text-[#9A9A9A] uppercase text-xs tracking-[0.2em] mb-3">
              {t('sections.newArrivalsEyebrow')}
            </p>
            <h2
              className="text-[#1A1A1A]"
              style={{ fontWeight: 400, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '0.02em' }}
            >
              {t('sections.newArrivalsTitle')}
            </h2>
          </div>
          <LinkBase href="/products?filter=new" className="text-xs uppercase self-end">
            {viewAll}
          </LinkBase>
        </div>
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-[#9A9A9A] text-sm">{comingSoon}</p>
        )}
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-12">
          <div>
            <p className="text-[#9A9A9A] uppercase text-xs tracking-[0.2em] mb-3">
              {t('sections.bestSellersEyebrow')}
            </p>
            <h2
              className="text-[#1A1A1A]"
              style={{ fontWeight: 400, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '0.02em' }}
            >
              {t('sections.bestSellersTitle')}
            </h2>
          </div>
          <LinkBase href="/products?filter=bestseller" className="text-xs uppercase self-end">
            {viewAll}
          </LinkBase>
        </div>
        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-[#9A9A9A] text-sm">{comingSoon}</p>
        )}
      </section>
    </>
  );
}
