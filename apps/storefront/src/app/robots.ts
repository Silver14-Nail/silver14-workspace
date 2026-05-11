import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: '/',
      disallow: ['/cart', '/checkout', '/account'],
      userAgent: '*',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
