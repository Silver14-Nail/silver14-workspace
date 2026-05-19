'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isInitialized, user, initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isInitialized, user, pathname, router]);

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
        <Loader2 className="w-5 h-5 animate-spin text-[#9CA3AF]" />
      </div>
    );
  }

  return <>{children}</>;
}
