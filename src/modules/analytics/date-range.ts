import type { AnalyticsFilters, AnalyticsGroup } from './validators'

export const STORE_TIME_ZONE = 'Asia/Dhaka'
const DAY_MS = 86_400_000

function dhakaDateText(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function startOfDhakaDate(text: string): Date {
  return new Date(`${text}T00:00:00+06:00`)
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

export function resolveAnalyticsRange(filters: AnalyticsFilters, now = new Date()) {
  const today = startOfDhakaDate(dhakaDateText(now))
  const tomorrow = addDays(today, 1)
  let start: Date | null
  let end: Date | null = tomorrow

  switch (filters.preset) {
    case 'today':
      start = today
      break
    case '7d':
      start = addDays(today, -6)
      break
    case '90d':
      start = addDays(today, -89)
      break
    case 'month':
      start = startOfDhakaDate(`${dhakaDateText(now).slice(0, 7)}-01`)
      break
    case 'year':
      start = startOfDhakaDate(`${dhakaDateText(now).slice(0, 4)}-01-01`)
      break
    case 'all':
      start = null
      end = null
      break
    case 'custom':
      start = startOfDhakaDate(filters.from!)
      end = addDays(startOfDhakaDate(filters.to!), 1)
      if (start >= end) {
        start = addDays(today, -29)
        end = tomorrow
      }
      break
    case '30d':
    default:
      start = addDays(today, -29)
  }

  const days = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS)) : null
  const automatic: Exclude<AnalyticsGroup, 'auto'> = days === null ? 'year' : days <= 90 ? 'day' : days <= 730 ? 'month' : 'year'
  const group: Exclude<AnalyticsGroup, 'auto'> = filters.group === 'auto' ? automatic : filters.group

  const previous = start && end ? { start: new Date(start.getTime() - (end.getTime() - start.getTime())), end: start } : null

  return { start, end, days, group, previous }
}
