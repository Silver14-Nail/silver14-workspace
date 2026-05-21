'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '../../../lib/logger';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Checkout route error', error, 'CheckoutError');
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <h2 className="text-xl font-semibold mb-3">Checkout unavailable</h2>
      <p className="text-gray-500 text-sm mb-2">
        An error occurred during checkout. No payment has been taken.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Your cart items are still saved.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/cart"
          className="px-5 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors"
        >
          Back to cart
        </Link>
      </div>
    </div>
  );
}
