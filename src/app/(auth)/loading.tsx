/** Login and reset read searchParams, which is per-request data. */
export default function AuthLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-7 w-40 rounded bg-(--color-surface)" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-4 w-20 rounded bg-(--color-surface)" />
          <div className="h-10 w-full rounded-md bg-(--color-surface)" />
        </div>
      ))}
      <div className="h-10 w-full rounded-md bg-(--color-surface)" />
    </div>
  )
}
