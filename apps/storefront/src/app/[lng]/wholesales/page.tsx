import { getCollections } from '@/features/collections/collections.api';
import WholesalesClient from './WholesalesClient';

export default async function WholesalePage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;

  let collectionNames: string[] = [];
  try {
    const res = await getCollections({ limit: 100, locale: lng });
    collectionNames = res.data.map((c) => c.name);
  } catch {
    // API unavailable — WholesalesClient will render the static fallback list
  }

  return <WholesalesClient collections={collectionNames} />;
}
