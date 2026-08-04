'use client'

import { useId, type ComponentProps } from 'react'

type Props = ComponentProps<'input'> & {
  label: string
  error?: string | undefined
}

export function Input({ label, error, id, className = '', ...props }: Props) {
  /**
   * Controlled fields often have neither `id` nor `name` — they are driven by
   * value/onChange. Without a fallback the label's `htmlFor` pointed at nothing,
   * so clicking it focused nothing and screen readers announced an unlabelled
   * box. Generating one here fixes every caller at once.
   */
  const generatedId = useId()
  const inputId = id ?? props.name ?? generatedId

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
