export default function CollectionsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="bg-gray-200 h-8 rounded w-48 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="bg-gray-200 aspect-square rounded-md mb-3" />
            <div className="bg-gray-200 h-4 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
