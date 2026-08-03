import type { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base =
    'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-opacity disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)'

  const variants = {
    primary: 'bg-(--color-accent) text-(--color-accent-fg) hover:opacity-90',
    ghost: 'border border-(--color-border) hover:bg-(--color-surface)',
  }

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
