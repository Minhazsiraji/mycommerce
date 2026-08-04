/** Covers every admin route, and supplies the Suspense boundary cacheComponents wants. */
export default function AdminLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-8 w-40 rounded bg-(--color-surface)" />
      <div className="h-10 w-full rounded-md bg-(--color-surface)" />
      <div className="flex flex-col gap-2 rounded-lg border border-(--color-border) p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-(--color-surface)" />
        ))}
      </div>
    </div>
  )
}
