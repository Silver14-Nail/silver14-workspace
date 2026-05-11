import type { Metadata } from 'next';
import { products } from '@/MOCK_DATAS/products';
import { createStorefrontMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string; slug: string }>;
}): Promise<Metadata> {
  const { lng, slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {
      ...createStorefrontMetadata({
        locale: lng,
        path: `/products/${slug}`,
      }),
      title: 'Product not found',
    };
  }

  const displayPrice = product.salePrice ?? product.price;

  return {
    ...createStorefrontMetadata({
      locale: lng,
      path: `/products/${product.slug}`,
    }),
    description: product.description,
    openGraph: {
      description: product.description,
      images: product.images.map((image) => ({
        alt: product.name,
        url: image,
      })),
      title: `${product.name} - $${displayPrice}`,
      type: 'website',
      url: `/${lng}/products/${product.slug}`,
    },
    title: product.name,
    twitter: {
      card: 'summary_large_image',
      description: product.description,
      images: product.images,
      title: product.name,
    },
  };
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
