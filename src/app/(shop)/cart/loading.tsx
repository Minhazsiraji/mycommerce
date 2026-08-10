/** The cart is per-visitor, so it also supplies the Suspense boundary cacheComponents requires. */
export default function CartLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="h-9 w-48 rounded bg-(--color-surface)" />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col divide-y divide-(--color-border) border-y border-(--color-border)">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="flex gap-4 py-5">
              <div className="size-20 shrink-0 rounded-md bg-(--color-surface)" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-1/2 rounded bg-(--color-surface)" />
                <div className="h-3 w-20 rounded bg-(--color-surface)" />
                <div className="mt-2 h-8 w-28 rounded-md bg-(--color-surface)" />
              </div>
              <div className="h-4 w-20 rounded bg-(--color-surface)" />
            </li>
          ))}
        </ul>

        <div className="storefront-card flex h-fit flex-col gap-4 p-5">
          <div className="h-4 w-24 rounded bg-(--color-bg)" />
          <div className="h-4 w-full rounded bg-(--color-bg)" />
          <div className="h-11 w-full rounded-md bg-(--color-bg)" />
        </div>
      </div>
    </div>
  )
}
