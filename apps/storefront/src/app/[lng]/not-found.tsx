import Link from 'next/link';

// Triggered by notFound() calls or unmatched routes within a locale segment.
export default function LocaleNotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl font-bold tracking-tight mb-4">404</p>
      <h1 className="text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
      >
        Back to home
      </Link>
    </main>
  );
}
