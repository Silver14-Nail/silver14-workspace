import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import { listUsers } from '@/services/users.service';
import type { UserRole } from '@/services/users.service';
import { UsersClient } from './_components/UsersClient';

type SearchParams = Promise<{
  page?: string;
  search?: string;
  role?: string;
  status?: string;
}>;

async function UsersContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || '';
  const role = (['admin', 'customer', 'wholesale'] as UserRole[]).includes(params.role as UserRole)
    ? (params.role as UserRole)
    : undefined;
  const isActive =
    params.status === 'active' ? true : params.status === 'inactive' ? false : undefined;

  const data = await listUsers({ page, search, role, isActive, limit: 20 });

  return (
    <UsersClient
      data={data}
      currentSearch={search}
      currentRole={params.role || 'all'}
      currentStatus={params.status || 'all'}
      currentPage={page}
    />
  );
}

export default function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-[#9CA3AF] animate-spin" />
        </div>
      }
    >
      <UsersContent searchParams={searchParams} />
    </Suspense>
  );
}
