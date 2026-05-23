import { fetchProductBySlug, fetchProducts } from '@/lib/products.api';
import { adaptDetail, adaptListItem } from '@/lib/product.adapter';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductNotFound } from './components';

const REVALIDATE = { next: { revalidate: 60 } } satisfies RequestInit;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { slug, lng } = await params;

  const [productData, relatedData] = await Promise.all([
    fetchProductBySlug(slug, lng, REVALIDATE).catch(() => null),
    fetchProducts({ limit: 9, locale: lng }, REVALIDATE).catch(() => null),
  ]);

  if (!productData) {
    return <ProductNotFound />;
  }

  const product = adaptDetail(productData);
  const related = (relatedData?.items ?? [])
    .map(adaptListItem)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}
