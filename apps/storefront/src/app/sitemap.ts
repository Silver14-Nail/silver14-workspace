import type { MetadataRoute } from 'next';
import { getCanonicalUrl, getLanguageAlternates, storefrontLocales } from '@/lib/seo';

const staticPaths = ['', '/products', '/wholesales', '/order/tracking'];
type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

const getStaticChangeFrequency = (path: string): SitemapChangeFrequency =>
  path === '' ? 'weekly' : 'monthly';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function fetchActiveProductSlugs(): Promise<{ slug: string; isBestSeller: boolean }[]> {
  try {
    const res = await fetch(`${API_BASE}/client-api/products?limit=500`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? [])
      .filter((p: { slug: string | null }) => p.slug)
      .map((p: { slug: string; isBestSeller: boolean }) => ({
        slug: p.slug,
        isBestSeller: p.isBestSeller,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await fetchActiveProductSlugs();

  return storefrontLocales.flatMap((locale) => [
    ...staticPaths.map((path) => ({
      alternates: {
        languages: getLanguageAlternates(path),
      },
      changeFrequency: getStaticChangeFrequency(path),
      lastModified: now,
      priority: path === '' ? 1 : 0.7,
      url: getCanonicalUrl(locale, path),
    })),
    ...products.map(({ slug, isBestSeller }) => {
      const path = `/products/${slug}`;
      return {
        alternates: {
          languages: getLanguageAlternates(path),
        },
        changeFrequency: 'weekly' as const,
        lastModified: now,
        priority: isBestSeller ? 0.9 : 0.8,
        url: getCanonicalUrl(locale, path),
      };
    }),
  ]);
}
