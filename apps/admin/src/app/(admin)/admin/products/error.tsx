'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Products] Render error:', error);
  }, [error]);

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="size-6 text-red-500" />
      </div>
      <h2 className="text-base font-semibold text-[#111827] mb-1">Something went wrong</h2>
      <p className="text-sm text-[#6B7280] mb-6 max-w-sm">
        {error.message || 'An unexpected error occurred while loading the products page.'}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 rounded bg-[#111827] text-white text-sm font-medium hover:bg-[#1F2937] transition-colors"
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
    </div>
  );
}
