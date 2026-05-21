import type { Metadata } from 'next';
import { createStorefrontMetadata, siteUrl, siteName } from '@/lib/seo';
import { getCollectionBySlug } from '../../../../features/collections/collections.api';

interface CollectionLayoutProps {
  params: Promise<{ lng: string; slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string; slug: string }>;
}): Promise<Metadata> {
  const { lng, slug } = await params;

  try {
    const collection = await getCollectionBySlug(slug);
    const path = `/collections/${slug}`;
    const base = createStorefrontMetadata({ locale: lng, path });

    const ogImages = collection.image
      ? [{ url: collection.image, alt: collection.name, width: 1200, height: 630 }]
      : [{ url: '/og-image.jpg', alt: siteName, width: 1200, height: 630 }];

    return {
      ...base,
      title: collection.seoTitle ?? collection.name,
      description:
        collection.seoDescription ?? collection.shortDescription ?? base.description,
      openGraph: {
        type: 'website',
        url: `${siteUrl}/${lng}${path}`,
        siteName,
        locale: lng,
        title: collection.seoTitle ?? collection.name,
        description: collection.seoDescription ?? collection.shortDescription,
        images: ogImages,
      },
    };
  } catch {
    return createStorefrontMetadata({ locale: lng, path: `/collections/${slug}` });
  }
}

export default function CollectionSlugLayout({ children }: CollectionLayoutProps) {
  return children;
}
