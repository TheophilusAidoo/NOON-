export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow animate-pulse overflow-hidden">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="h-64 md:h-80 bg-gray-200 rounded-lg animate-pulse w-full" />
  );
}
