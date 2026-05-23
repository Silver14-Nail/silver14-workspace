import { fetchSupplyBySlug } from '@/lib/products.api';
import { SupplyDetailClient } from './SupplyDetailClient';
import { SupplyNotFound } from './components';

const REVALIDATE = { next: { revalidate: 60 } } satisfies RequestInit;

export default async function SupplyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { slug, lng } = await params;

  const supply = await fetchSupplyBySlug(slug, lng, REVALIDATE).catch(() => null);

  if (!supply) {
    return <SupplyNotFound />;
  }

  return <SupplyDetailClient supply={supply} />;
}
