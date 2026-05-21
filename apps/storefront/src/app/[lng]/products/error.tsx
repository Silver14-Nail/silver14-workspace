'use client';

import { useEffect } from 'react';
import { logger } from '../../../lib/logger';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Products route error', error, 'ProductsError');
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-semibold mb-3">Unable to load products</h2>
      <p className="text-gray-500 text-sm mb-6">
        Something went wrong. Your cart and session are intact.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
