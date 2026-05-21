import { listCollections, getCollectionStats } from '../../../../services/collections.service';
import { CollectionsClient } from './_components/CollectionsClient';

interface CollectionsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function AdminCollectionsPage({ searchParams }: CollectionsPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || '';

  const [collectionsResult, statsResult] = await Promise.allSettled([
    listCollections({ page, limit: 20, search: search || undefined }),
    getCollectionStats(),
  ]);

  const initialCollections =
    collectionsResult.status === 'fulfilled'
      ? collectionsResult.value
      : { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };

  const initialStats =
    statsResult.status === 'fulfilled'
      ? statsResult.value
      : { total: 0, active: 0, featured: 0 };

  return (
    <CollectionsClient
      initialCollections={initialCollections}
      initialStats={initialStats}
      currentPage={page}
      currentSearch={search}
    />
  );
}
