export default function OrdersLoading() {
  return (
    <div className="space-y-4 animate-pulse py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-4">
          <div className="flex justify-between mb-3">
            <div className="bg-gray-200 h-4 rounded w-1/4" />
            <div className="bg-gray-200 h-4 rounded w-1/6" />
          </div>
          <div className="bg-gray-200 h-3 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}
