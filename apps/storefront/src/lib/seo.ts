import type { Metadata } from 'next';
import { products } from '@/MOCK_DATAS/products';

export const storefrontLocales = ['en', 'vi'] as const;

export type StorefrontLocale = (typeof storefrontLocales)[number];

export const siteUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'https://silver14nail.com';

export const siteName = 'Silver14 Nail';

const seoByLocale: Record<
  StorefrontLocale,
  {
    description: string;
    title: string;
  }
> = {
  en: {
    title: 'Silver14 Nail | Handmade Press-On Nails',
    description:
      'Shop handmade luxury press-on nails from Silver14 Nail. Reusable nail sets, custom sizing, worldwide shipping, and wholesale options.',
  },
  vi: {
    title: 'Silver14 Nail | Móng giả thủ công cao cấp',
    description:
      'Mua móng giả thủ công cao cấp từ Silver14 Nail. Bộ móng tái sử dụng, tùy chỉnh kích thước, giao hàng quốc tế và hỗ trợ bán sỉ.',
  },
};

export function getStorefrontSeo(locale: string) {
  return seoByLocale[isStorefrontLocale(locale) ? locale : 'en'];
}

export function getLocalizedPath(locale: string, path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function getCanonicalUrl(locale: string, path = '') {
  return `${siteUrl}${getLocalizedPath(locale, path)}`;
}

export function getLanguageAlternates(path = '') {
  return Object.fromEntries(
    storefrontLocales.map((locale) => [locale, `${siteUrl}${getLocalizedPath(locale, path)}`]),
  );
}

export function createStorefrontMetadata({
  locale,
  path = '',
}: {
  locale: string;
  path?: string;
}): Metadata {
  const seo = getStorefrontSeo(locale);
  const canonical = getCanonicalUrl(locale, path);

  return {
    alternates: {
      canonical,
      languages: getLanguageAlternates(path),
    },
    description: seo.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      description: seo.description,
      images: [
        {
          alt: siteName,
          height: 630,
          url: products[0]?.images[0] ?? '/og-image.jpg',
          width: 1200,
        },
      ],
      locale,
      siteName,
      title: seo.title,
      type: 'website',
      url: canonical,
    },
    robots: {
      follow: true,
      index: true,
    },
    title: {
      default: seo.title,
      template: `%s | ${siteName}`,
    },
    twitter: {
      card: 'summary_large_image',
      description: seo.description,
      title: seo.title,
    },
  };
}

export function createStorefrontJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteName,
        url: `${siteUrl}/${locale}`,
      },
      {
        '@type': 'WebSite',
        inLanguage: locale,
        name: siteName,
        potentialAction: {
          '@type': 'SearchAction',
          query: 'required name=search_term_string',
          target: `${siteUrl}/${locale}/products?search={search_term_string}`,
        },
        url: `${siteUrl}/${locale}`,
      },
    ],
  };
}

function isStorefrontLocale(locale: string): locale is StorefrontLocale {
  return storefrontLocales.includes(locale as StorefrontLocale);
}
