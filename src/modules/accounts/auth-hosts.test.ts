import { describe, expect, it } from 'vitest'

import { authAllowedHosts } from './auth-hosts'

describe('authAllowedHosts', () => {
  it('allows the canonical store and exact Vercel deployment hosts', () => {
    expect(
      authAllowedHosts({
        canonicalUrl: 'https://mycommerce-sepia.vercel.app',
        publicUrl: 'https://mycommerce-sepia.vercel.app',
        vercelUrl: 'mycommerce-abc123-owner.vercel.app',
        vercelBranchUrl: 'mycommerce-git-agent-preview-owner.vercel.app',
      }),
    ).toEqual([
      'mycommerce-sepia.vercel.app',
      'mycommerce-abc123-owner.vercel.app',
      'mycommerce-git-agent-preview-owner.vercel.app',
    ])
  })

  it('ignores malformed values instead of widening trust', () => {
    expect(
      authAllowedHosts({
        canonicalUrl: 'https://sirajibd.com',
        vercelUrl: '://bad host',
      }),
    ).toEqual(['sirajibd.com'])
  })
})
