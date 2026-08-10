type AnnouncementFact = {
  key: 'delivery' | 'threshold'
  label: string
}

export function AnnouncementBar({ facts }: { facts: AnnouncementFact[] }) {
  if (facts.length === 0) return null

  return (
    <aside aria-label="Store information" className="border-b border-(--border-subtle) bg-(--background-subtle)">
      <ul className="mx-auto flex min-h-11 w-full max-w-(--container-content) items-center gap-x-5 overflow-x-auto px-4 py-2 text-xs font-medium whitespace-nowrap text-(--text-secondary) sm:justify-center sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {facts.map((fact, index) => (
          <li key={fact.key} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true" className="mr-3 hidden h-4 w-px bg-(--border-strong) sm:block" /> : null}
            <span className="text-(--action-primary)">
              {fact.key === 'delivery' ? <TruckIcon /> : <TagIcon />}
            </span>
            {fact.label}
          </li>
        ))}
      </ul>
    </aside>
  )
}

function TruckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M12.6 2.7a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.5 8.5a2 2 0 0 0 2.8 0l6.8-6.8a2 2 0 0 0 0-2.8Z" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" />
    </svg>
  )
}
