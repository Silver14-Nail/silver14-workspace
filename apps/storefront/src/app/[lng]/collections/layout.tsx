import type { Metadata } from 'next';
import { createStorefrontMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng } = await params;

  return {
    ...createStorefrontMetadata({ locale: lng, path: '/collections' }),
    title: 'Collections',
    description:
      'Browse all nail art collections from Silver14 Nail — from classic French tips to bold seasonal sets.',
  };
}

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
