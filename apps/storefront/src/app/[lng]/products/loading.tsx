export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-md mb-3" />
            <div className="bg-gray-200 h-4 rounded mb-2 w-3/4" />
            <div className="bg-gray-200 h-3 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
