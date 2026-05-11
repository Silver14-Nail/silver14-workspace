import type { MetadataRoute } from 'next';
import { products } from '@/MOCK_DATAS/products';
import { getCanonicalUrl, getLanguageAlternates, storefrontLocales } from '@/lib/seo';

const staticPaths = ['', '/products', '/wholesales', '/order/tracking'];
type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

const getStaticChangeFrequency = (path: string): SitemapChangeFrequency =>
  path === '' ? 'weekly' : 'monthly';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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
    ...products.map((product) => {
      const path = `/products/${product.slug}`;

      return {
        alternates: {
          languages: getLanguageAlternates(path),
        },
        changeFrequency: 'weekly' as const,
        lastModified: now,
        priority: product.isBestSeller ? 0.9 : 0.8,
        url: getCanonicalUrl(locale, path),
      };
    }),
  ]);
}
