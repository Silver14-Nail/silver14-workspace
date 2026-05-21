'use client';

import { useEffect } from 'react';
import { logger } from '../../../../lib/logger';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Orders route error', error, 'OrdersError');
  }, [error]);

  return (
    <div className="py-12 text-center">
      <h2 className="text-lg font-semibold mb-3">Unable to load orders</h2>
      <p className="text-gray-500 text-sm mb-6">
        Something went wrong loading your order history.
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
