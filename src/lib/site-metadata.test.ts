import { describe, expect, it } from 'vitest'

import { getSiteUrl, isIndexableEnvironment } from './site-metadata'

describe('site metadata environment policy', () => {
  it('allows indexing only on Vercel production', () => {
    expect(isIndexableEnvironment('production')).toBe(true)
    expect(isIndexableEnvironment('preview')).toBe(false)
    expect(isIndexableEnvironment('development')).toBe(false)
    expect(isIndexableEnvironment(undefined)).toBe(false)
  })

  it('uses the approved canonical launch origin', () => {
    expect(getSiteUrl().href).toBe('https://sirajibd.com/')
  })
})

