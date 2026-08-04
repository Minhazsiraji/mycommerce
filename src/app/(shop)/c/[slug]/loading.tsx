export default function CategoryLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="h-9 w-56 rounded bg-(--color-surface)" />
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-(--color-surface)" />
        <div className="h-4 w-48 rounded bg-(--color-surface)" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square rounded-lg bg-(--color-surface)" />
            <div className="h-3 w-16 rounded bg-(--color-surface)" />
            <div className="h-4 w-3/4 rounded bg-(--color-surface)" />
            <div className="h-4 w-20 rounded bg-(--color-surface)" />
          </div>
        ))}
      </div>
    </div>
  )
}
