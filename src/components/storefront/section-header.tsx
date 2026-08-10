export function SectionHeader({
  id,
  title,
  description,
}: {
  id: string
  title: string
  description?: string
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <h2 id={id} className="text-2xl font-semibold tracking-(--tracking-heading) text-(--text-primary) sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="text-base leading-7 text-(--text-secondary)">{description}</p> : null}
    </div>
  )
}
