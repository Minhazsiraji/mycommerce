'use client'

import { useId, type ComponentProps } from 'react'

type Props = ComponentProps<'select'> & {
  label: string
  error?: string | undefined
}

export function Select({ label, error, id, className = '', children, ...props }: Props) {
  const generatedId = useId()
  const selectId = id ?? props.name ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={`h-10 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-(--color-danger)">{error}</p> : null}
    </div>
  )
}
