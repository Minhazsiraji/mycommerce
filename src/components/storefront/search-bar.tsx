type SearchBarProps = {
  id: string
  className?: string
  label?: string
  placeholder?: string
}

export function SearchBar({
  id,
  className = '',
  label = 'Search products',
  placeholder = 'Search products',
}: SearchBarProps) {
  return (
    <form action="/search" role="search" aria-label={label} className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <SearchIcon />
        <input
          id={id}
          name="q"
          type="search"
          placeholder={placeholder}
          className="h-12 w-full rounded-(--input-radius) border border-(--border-subtle) bg-(--surface-primary) pr-4 pl-11 text-base text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted) hover:border-(--border-strong) focus-visible:border-(--border-interactive) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
        />
      </div>
    </form>
  )
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-(--text-muted)"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}
