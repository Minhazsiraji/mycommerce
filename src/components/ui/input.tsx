import type { ComponentProps } from 'react'

type Props = ComponentProps<'input'> & {
  label: string
  error?: string | undefined
}

export function Input({ label, error, id, className = '', ...props }: Props) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`h-10 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  )
}
