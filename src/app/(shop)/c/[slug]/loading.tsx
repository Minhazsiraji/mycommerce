export default function CategoryLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-7" role="status" aria-label="Loading category products">
      <span className="sr-only">Loading products…</span>
      <div className="h-5 w-52 rounded-(--radius-sm) bg-(--surface-secondary)" />
      <div className="space-y-3"><div className="h-10 w-64 rounded-(--radius-md) bg-(--surface-secondary)" /><div className="h-4 w-full max-w-xl rounded bg-(--surface-secondary)" /></div>
      <div className="h-16 rounded-(--radius-xl) border bg-(--surface-primary) shadow-(--shadow-1)" />
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden h-96 rounded-(--radius-xl) border bg-(--surface-primary) lg:block" />
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="space-y-3"><div className="aspect-[4/5] rounded-(--radius-lg) bg-(--surface-secondary)" /><div className="h-3 w-16 rounded bg-(--surface-secondary)" /><div className="h-4 w-3/4 rounded bg-(--surface-secondary)" /><div className="h-4 w-20 rounded bg-(--surface-secondary)" /></div>)}
        </div>
      </div>
    </div>
  )
}
