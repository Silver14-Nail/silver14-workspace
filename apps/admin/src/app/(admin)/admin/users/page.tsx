import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import { UsersClient } from './_components/UsersClient';

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-[#9CA3AF] animate-spin" />
        </div>
      }
    >
      <UsersClient />
    </Suspense>
  );
}
