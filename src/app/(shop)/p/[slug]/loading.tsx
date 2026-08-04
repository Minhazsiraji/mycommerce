/**
 * Catalog pages render on demand, so navigation has real latency. A skeleton
 * that matches the final layout makes the wait feel shorter and — because the
 * boxes are the same size as the content — nothing shifts when it arrives.
 */
export default function ProductLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-10">
      <div className="h-4 w-40 rounded bg-(--color-surface)" />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-square rounded-lg bg-(--color-surface)" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="size-16 rounded-md bg-(--color-surface)" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-20 rounded bg-(--color-surface)" />
            <div className="h-8 w-3/4 rounded bg-(--color-surface)" />
          </div>
          <div className="h-8 w-40 rounded bg-(--color-surface)" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-20 rounded-md bg-(--color-surface)" />
            ))}
          </div>
          <div className="h-11 w-full rounded-md bg-(--color-surface)" />
          <div className="flex flex-col gap-2 border-t border-(--color-border) pt-6">
            <div className="h-3 w-24 rounded bg-(--color-surface)" />
            <div className="h-3 w-full rounded bg-(--color-surface)" />
            <div className="h-3 w-5/6 rounded bg-(--color-surface)" />
          </div>
        </div>
      </div>
    </div>
  )
}
