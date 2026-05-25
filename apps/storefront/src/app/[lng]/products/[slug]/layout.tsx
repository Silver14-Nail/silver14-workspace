import type { Metadata } from 'next';
import { createStorefrontMetadata } from '@/lib/seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function fetchProductForMeta(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/client-api/products/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<{
      name: string;
      slug: string;
      description: string | null;
      basePrice: string;
      salePrice: string | null;
      isOnSale: boolean;
      discountPercent: number | null;
      images: { url: string; sortOrder: number }[];
    }>;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string; slug: string }>;
}): Promise<Metadata> {
  const { lng, slug } = await params;
  const product = await fetchProductForMeta(slug);

  if (!product) {
    return {
      ...createStorefrontMetadata({
        locale: lng,
        path: `/products/${slug}`,
      }),
      title: 'Product not found',
    };
  }

  const basePrice = parseFloat(product.basePrice);
  const salePrice = product.salePrice != null ? parseFloat(product.salePrice) : null;
  const displayPrice = salePrice ?? basePrice;
  const images = product.images.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url);

  const priceLabel = product.isOnSale
    ? `$${displayPrice.toFixed(2)} (was $${basePrice.toFixed(2)})`
    : `$${displayPrice.toFixed(2)}`;

  return {
    ...createStorefrontMetadata({
      locale: lng,
      path: `/products/${product.slug ?? slug}`,
    }),
    description: product.description ?? undefined,
    openGraph: {
      description: product.description ?? undefined,
      images: images.map((url) => ({ alt: product.name, url })),
      title: `${product.name} — ${priceLabel}`,
      type: 'website',
      url: `/${lng}/products/${product.slug ?? slug}`,
    },
    title: product.name,
    twitter: {
      card: 'summary_large_image',
      description: product.description ?? undefined,
      images,
      title: product.name,
    },
  };
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
