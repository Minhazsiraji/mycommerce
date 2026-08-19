import { describe, expect, it } from 'vitest'

import { googleAdminFormDefaults } from './admin-defaults'

/**
 * The regression these cover is subtle and cost a working purchase event on
 * Preview: the form used to derive its purchase default from the *effective*
 * config, which on a fresh store is computed from a tag that does not exist
 * yet, so it was always false. Saving the form then persisted that false.
 */
describe('google admin form defaults', () => {
  const noEnvFallback = { enabled: false }

  it('defaults purchase measurement ON for a store with nothing saved', () => {
    expect(googleAdminFormDefaults(null, noEnvFallback).purchaseTrackingEnabled).toBe(true)
  })

  it('still defaults purchase measurement ON when there is no env tag to derive from', () => {
    // This is the exact Preview shape: no settings row, no NEXT_PUBLIC_GOOGLE_TAG_ID.
    expect(googleAdminFormDefaults(undefined, { enabled: false }).purchaseTrackingEnabled).toBe(true)
  })

  it('leaves tracking itself off until the operator turns it on', () => {
    expect(googleAdminFormDefaults(null, noEnvFallback).trackingEnabled).toBe(false)
  })

  it('adopts an env fallback for tracking when one exists', () => {
    expect(googleAdminFormDefaults(null, { enabled: true }).trackingEnabled).toBe(true)
  })

  it('never overrides a saved choice', () => {
    const saved = { trackingEnabled: true, tagId: 'GT-K4LJG7CS', purchaseTrackingEnabled: false }
    const defaults = googleAdminFormDefaults(saved, { enabled: true })

    expect(defaults).toEqual({
      trackingEnabled: true,
      tagId: 'GT-K4LJG7CS',
      purchaseTrackingEnabled: false,
    })
  })

  it('round-trips a saved row that has purchase measurement on', () => {
    const saved = { trackingEnabled: true, tagId: 'G-ABC123', purchaseTrackingEnabled: true }
    expect(googleAdminFormDefaults(saved, { enabled: true })).toEqual(saved)
  })

  it('shows an empty tag field rather than the word null', () => {
    const saved = { trackingEnabled: false, tagId: null, purchaseTrackingEnabled: true }
    expect(googleAdminFormDefaults(saved, noEnvFallback).tagId).toBe('')
  })
})
