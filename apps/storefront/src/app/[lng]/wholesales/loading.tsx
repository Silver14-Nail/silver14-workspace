export default function WholesalesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="bg-gray-200 h-8 rounded w-64 mx-auto mb-4" />
      <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-6 space-y-3">
            <div className="bg-gray-200 h-5 rounded w-1/2" />
            <div className="bg-gray-200 h-4 rounded" />
            <div className="bg-gray-200 h-4 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
