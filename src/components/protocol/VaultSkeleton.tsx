/** Placeholder cards with the same frame as real vault cards, so nothing moves when data arrives. */
export function VaultCardSkeleton() {
  return <div aria-hidden className="flex min-h-[520px] flex-col rounded-[26px] border border-white/10 bg-[#07090b] p-6 md:p-8">
    <div className="arvo-skeleton-dark h-3 w-28" /><div className="arvo-skeleton-dark mt-5 h-7 w-52" /><div className="arvo-skeleton-dark mt-3 h-4 w-60" />
    <div className="mt-6 grid gap-5 sm:grid-cols-2"><div><div className="arvo-skeleton-dark h-3 w-32" /><div className="arvo-skeleton-dark mt-3 h-10 w-44" /><div className="arvo-skeleton-dark mt-3 h-4 w-48" /></div><div className="space-y-3 self-end"><div className="arvo-skeleton-dark h-3 w-full" /><div className="arvo-skeleton-dark h-3 w-full" /><div className="arvo-skeleton-dark h-3 w-4/5" /></div></div>
    <div className="arvo-skeleton-dark mt-8 h-2 w-full" />
    <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="arvo-skeleton-dark h-11 rounded-2xl" /><div className="arvo-skeleton-dark h-11 rounded-2xl" /></div>
    <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2"><div className="arvo-skeleton-dark h-28 rounded-2xl" /><div className="flex flex-col justify-end gap-3"><div className="arvo-skeleton-dark h-11 rounded-2xl" /><div className="arvo-skeleton-dark h-12 rounded-xl" /></div></div>
  </div>;
}
export function VaultGridSkeleton({ count = 2 }: { count?: number }) {
  return <div role="status" aria-label="Loading vaults" className="mt-8 grid gap-5">
    {Array.from({ length: count }, (_, i) => <VaultCardSkeleton key={i} />)}
  </div>;
}
