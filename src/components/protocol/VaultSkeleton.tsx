/** Placeholder cards with the same frame as real vault cards, so nothing moves when data arrives. */
export function VaultCardSkeleton() {
  return <div aria-hidden className="grid min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#07090b] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,.9fr)] lg:divide-x lg:divide-white/10">
    <div className="p-8"><div className="arvo-skeleton-dark h-3 w-28" /><div className="arvo-skeleton-dark mt-6 h-8 w-56" /><div className="arvo-skeleton-dark mt-3 h-4 w-64" /><div className="arvo-skeleton-dark mt-8 h-3 w-32" /><div className="arvo-skeleton-dark mt-3 h-11 w-48" /><div className="arvo-skeleton-dark mt-3 h-4 w-52" /></div>
    <div className="hidden p-8 lg:block"><div className="arvo-skeleton-dark h-4 w-full" /><div className="arvo-skeleton-dark mt-4 h-4 w-5/6" /><div className="arvo-skeleton-dark mt-8 h-2 w-full" /><div className="arvo-skeleton-dark mt-8 h-12 w-full rounded-2xl" /></div>
    <div className="hidden flex-col p-8 lg:flex"><div className="arvo-skeleton-dark h-24 w-full rounded-2xl" /><div className="arvo-skeleton-dark mt-auto h-12 w-full rounded-xl" /></div>
  </div>;
}
export function VaultGridSkeleton({ count = 3 }: { count?: number }) {
  return <div role="status" aria-label="Loading vaults" className="mt-8 grid gap-5">
    {Array.from({ length: count }, (_, i) => <VaultCardSkeleton key={i} />)}
  </div>;
}
