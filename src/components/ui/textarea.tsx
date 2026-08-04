'use client'

import { useId, type ComponentProps } from 'react'

type Props = ComponentProps<'textarea'> & {
  label: string
  error?: string | undefined
}

export function Textarea({ label, error, id, className = '', ...props }: Props) {
  const generatedId = useId()
  const areaId = id ?? props.name ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={areaId} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={areaId}
        rows={5}
        aria-invalid={error ? true : undefined}
        className={`rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-(--color-danger)">{error}</p> : null}
    </div>
  )
}
