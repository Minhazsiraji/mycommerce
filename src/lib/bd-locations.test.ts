import { describe, expect, it } from 'vitest'

import {
  BD_DISTRICTS,
  bdAreasFor,
  bdCitiesFor,
  canonicalBdCity,
  isValidBdLocation,
} from './bd-locations'

describe('Bangladesh checkout location hierarchy', () => {
  it('covers all 64 districts', () => {
    expect(BD_DISTRICTS).toHaveLength(64)
  })

  it('supports the Dhaka, Savar, Ashulia delivery path', () => {
    expect(bdCitiesFor('Dhaka')).toContain('Savar')
    expect(bdAreasFor('Dhaka', 'Savar')).toContain('Ashulia')
    expect(isValidBdLocation('Dhaka', 'Savar', 'Ashulia')).toBe(true)
  })

  it('normalises an existing district-name city to its city option', () => {
    expect(canonicalBdCity('Dhaka', 'dhaka')).toBe('Dhaka City')
  })

  it('rejects cross-district and cross-city combinations', () => {
    expect(isValidBdLocation('Dhaka', 'Savar', 'Dhanmondi')).toBe(false)
    expect(isValidBdLocation('Dhaka', 'Chattogram City', 'Kotwali')).toBe(false)
  })

  it('never exposes a city or town with an empty area dropdown', () => {
    for (const district of BD_DISTRICTS) {
      for (const city of bdCitiesFor(district)) {
        expect(bdAreasFor(district, city).length, `${district} / ${city}`).toBeGreaterThan(0)
      }
    }
  })
})
