export default function CheckoutLoading() {
  return (
    <div className="mx-auto flex max-w-2xl animate-pulse flex-col gap-6">
      <div className="h-9 w-40 rounded bg-(--color-surface)" />
      <div className="storefront-card flex flex-col gap-3 p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-(--color-surface)" />
        ))}
      </div>
      <div className="h-24 rounded-lg bg-(--color-surface)" />
    </div>
  )
}
