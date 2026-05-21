export default function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="h-6 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse">
              <div className="bg-gray-200 h-4 rounded w-1/3 mb-3" />
              <div className="bg-gray-200 h-10 rounded mb-2" />
              <div className="bg-gray-200 h-10 rounded" />
            </div>
          ))}
        </div>
        <div className="animate-pulse space-y-3">
          <div className="bg-gray-200 h-4 rounded w-1/2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="bg-gray-200 h-3 rounded w-1/3" />
              <div className="bg-gray-200 h-3 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
