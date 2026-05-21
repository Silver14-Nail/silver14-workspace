'use client';

import { useEffect } from 'react';
import { logger } from '../../lib/logger';

// Catches rendering errors in [lng] pages. Renders inside the full document
// shell provided by [lng]/layout.tsx (html, body, Navbar, Footer are intact).
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Page render error', error, 'LocaleError');
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
      <p className="text-gray-500 text-sm mb-2">
        An unexpected error occurred while loading this page.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-6">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </main>
  );
}
