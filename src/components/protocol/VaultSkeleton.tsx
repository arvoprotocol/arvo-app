/** Placeholder cards with the same frame as real vault cards, so nothing moves when data arrives. */
export function VaultCardSkeleton() {
  return <div aria-hidden className="flex min-h-[640px] flex-col rounded-[24px] border border-white/10 bg-[#07090b] p-6">
    <div className="arvo-skeleton-dark h-3 w-28" />
    <div className="arvo-skeleton-dark mt-6 h-8 w-48" />
    <div className="arvo-skeleton-dark mt-3 h-4 w-56" />
    <div className="arvo-skeleton-dark mt-8 h-3 w-32" />
    <div className="arvo-skeleton-dark mt-3 h-11 w-44" />
    <div className="arvo-skeleton-dark mt-3 h-4 w-40" />
    <div className="arvo-skeleton-dark mt-8 h-2 w-full" />
    <div className="arvo-skeleton-dark mt-8 h-20 w-full rounded-2xl" />
    <div className="arvo-skeleton-dark mt-auto h-12 w-full rounded-xl" />
  </div>;
}
export function VaultGridSkeleton({ count = 3 }: { count?: number }) {
  return <div role="status" aria-label="Loading vaults" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }, (_, i) => <VaultCardSkeleton key={i} />)}
  </div>;
}
