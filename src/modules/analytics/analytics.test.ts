import { describe, expect, it } from 'vitest'

import { csvCell } from './csv'
import { resolveAnalyticsRange } from './date-range'
import { analyticsFiltersSchema } from './validators'

describe('analytics filters', () => {
  it('defaults to the last 30 days and daily grouping', () => {
    const filters = analyticsFiltersSchema.parse({})
    const range = resolveAnalyticsRange(filters, new Date('2026-08-16T10:00:00Z'))
    expect(filters.preset).toBe('30d')
    expect(range.days).toBe(30)
    expect(range.group).toBe('day')
    expect(range.start?.toISOString()).toBe('2026-07-17T18:00:00.000Z')
    expect(range.end?.toISOString()).toBe('2026-08-16T18:00:00.000Z')
  })

  it('uses inclusive Bangladesh calendar dates for a custom range', () => {
    const filters = analyticsFiltersSchema.parse({ preset: 'custom', from: '2026-01-01', to: '2026-01-31' })
    const range = resolveAnalyticsRange(filters)
    expect(range.days).toBe(31)
    expect(range.start?.toISOString()).toBe('2025-12-31T18:00:00.000Z')
    expect(range.end?.toISOString()).toBe('2026-01-31T18:00:00.000Z')
  })

  it('falls back safely when custom dates are incomplete', () => {
    expect(analyticsFiltersSchema.parse({ preset: 'custom', from: '2026-01-01' }).preset).toBe('30d')
  })
})

describe('analytics CSV', () => {
  it('escapes quotes and spreadsheet formulas', () => {
    expect(csvCell('A "quoted" title')).toBe('"A ""quoted"" title"')
    expect(csvCell('=IMPORTXML("bad")')).toBe('"\'=IMPORTXML(""bad"")"')
  })
})
