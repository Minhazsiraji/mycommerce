/**
 * Also the Suspense boundary cacheComponents requires: reading the session is
 * uncached per-request data, and without a boundary it would block the whole
 * document from streaming.
 */
export default function AccountLoading() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl animate-pulse flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 rounded bg-(--color-surface)" />
        <div className="h-4 w-64 rounded bg-(--color-surface)" />
      </div>
      <div className="storefront-card flex flex-col gap-3 p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-(--color-surface)" />
        ))}
      </div>
      <div className="h-10 w-24 rounded-md bg-(--color-surface)" />
    </main>
  )
}
