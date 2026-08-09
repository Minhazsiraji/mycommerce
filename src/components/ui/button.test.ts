import { describe, expect, it } from 'vitest'

import { buttonClassName } from './button'

describe('buttonClassName', () => {
  it('uses semantic primary and focus tokens by default', () => {
    const className = buttonClassName()

    expect(className).toContain('bg-(--action-primary)')
    expect(className).toContain('text-(--action-primary-text)')
    expect(className).toContain('focus-visible:outline-(--focus-ring)')
    expect(className).toContain('h-(--button-height-md)')
  })

  it('applies the approved secondary hero contract', () => {
    const className = buttonClassName({ variant: 'secondary', size: 'hero' })

    expect(className).toContain('border-(--border-strong)')
    expect(className).toContain('h-(--button-height-hero)')
  })
})
