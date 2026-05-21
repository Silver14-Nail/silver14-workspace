export default function CartLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="h-7 bg-gray-200 rounded w-32 mb-8 animate-pulse" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="bg-gray-200 w-20 h-20 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="bg-gray-200 h-4 rounded w-1/2" />
              <div className="bg-gray-200 h-3 rounded w-1/4" />
            </div>
            <div className="bg-gray-200 h-4 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
