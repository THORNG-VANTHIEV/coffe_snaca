import { cn } from '@/utils/cn'

/**
 * Skeleton cards rather than a bare "Loading…" — the page keeps its shape
 * while data arrives, which reads as much faster (spec §42).
 */

function Bar({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} aria-hidden="true" />
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border/70 bg-surface shadow-card">
      <div className="skeleton aspect-[4/3] w-full" aria-hidden="true" />
      <div className="flex flex-col gap-2.5 p-4">
        <Bar className="h-4 w-3/4" />
        <Bar className="h-3 w-1/2" />
        <Bar className="h-3 w-full" />
        <Bar className="mt-2 h-4 w-2/5" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function CategoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-2.5 overflow-hidden">
      {Array.from({ length: count }, (_, index) => (
        <Bar key={index} className="h-11 w-28 shrink-0 rounded-pill" />
      ))}
    </div>
  )
}

/** Full home-page placeholder shown while `db.json` loads. */
export function HomeSkeleton({ label }: { label: string }) {
  return (
    <div className="container-page py-6" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Bar className="h-44 w-full rounded-card sm:h-64" />
      <Bar className="mt-6 h-12 w-full rounded-pill" />
      <div className="mt-6">
        <CategoryListSkeleton />
      </div>
      <Bar className="mt-8 h-6 w-40" />
      <div className="mt-4">
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  )
}
