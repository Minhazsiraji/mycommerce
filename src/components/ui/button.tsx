import type { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'hero'
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: Props['variant']
  size?: Props['size']
  className?: string
} = {}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-(--radius-md) px-5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)'

  const variants = {
    primary:
      'bg-(--action-primary) text-(--action-primary-text) hover:bg-(--action-primary-hover) active:bg-(--action-primary-active)',
    secondary:
      'border border-(--border-strong) bg-(--surface-primary) text-(--text-primary) hover:bg-(--surface-secondary)',
    ghost:
      'border border-(--border-subtle) bg-transparent text-(--text-primary) hover:bg-(--surface-secondary)',
  }

  const sizes = {
    sm: 'h-(--button-height-sm) px-4',
    md: 'h-(--button-height-md)',
    lg: 'h-(--button-height-lg) px-6 text-base',
    hero: 'h-(--button-height-hero) px-7 text-base',
  }

  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) {
  return <button className={buttonClassName({ variant, size, className })} {...props} />
}
