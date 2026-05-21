export default function AccountLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-gray-200 h-7 rounded w-40 mb-6 animate-pulse" />
      <div className="space-y-4 animate-pulse">
        <div className="bg-gray-200 h-10 rounded" />
        <div className="bg-gray-200 h-10 rounded" />
        <div className="bg-gray-200 h-10 rounded w-1/2" />
      </div>
    </div>
  );
}
