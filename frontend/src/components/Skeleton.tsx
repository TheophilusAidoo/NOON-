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
    <div className="aspect-[16/11] w-full animate-pulse rounded-lg bg-gray-200 min-[480px]:aspect-[2.35/1] md:aspect-[3/1] md:max-h-[22rem]" />
  );
}
