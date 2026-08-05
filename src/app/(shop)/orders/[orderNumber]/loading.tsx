/** Per-visitor order data, so it also supplies the required Suspense boundary. */
export default function OrderLoading() {
  return (
    <div className="mx-auto flex max-w-2xl animate-pulse flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-3/4 rounded bg-(--color-surface)" />
        <div className="h-4 w-full rounded bg-(--color-surface)" />
        <div className="h-4 w-40 rounded bg-(--color-surface)" />
      </div>
      <div className="h-40 rounded-lg bg-(--color-surface)" />
      <div className="h-48 rounded-lg bg-(--color-surface)" />
    </div>
  )
}
