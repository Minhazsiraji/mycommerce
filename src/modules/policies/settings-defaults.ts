export const POLICY_SETTINGS_ID = 'default'

export type PolicySettingsValues = {
  returnWindowDays: number | null
  refundProcessingMinDays: number | null
  refundProcessingMaxDays: number | null
}

/**
 * Nothing. Deliberately.
 *
 * A default of "7 days" would still be this software promising a return window
 * on behalf of a business that never chose one — the same defect as hardcoding
 * it, one layer down. Unset renders as "confirmed when you contact us", which
 * is vague but true; a number the store never agreed to is specific and false.
 */
export const DEFAULT_POLICY_SETTINGS: PolicySettingsValues = {
  returnWindowDays: null,
  refundProcessingMinDays: null,
  refundProcessingMaxDays: null,
}

/** "7 calendar days", or null when the store has not set a window. */
export function returnWindowText(settings: PolicySettingsValues): string | null {
  const days = settings.returnWindowDays
  if (days === null) return null
  return `${days} calendar day${days === 1 ? '' : 's'}`
}

/** "5–7 business days", "3 business days", or null when unset. */
export function refundProcessingText(settings: PolicySettingsValues): string | null {
  const { refundProcessingMinDays: min, refundProcessingMaxDays: max } = settings
  if (min === null && max === null) return null

  const low = min ?? max
  const high = max ?? min
  if (low === null || high === null) return null

  const range = low === high ? `${low}` : `${low}–${high}`
  return `${range} business day${high === 1 ? '' : 's'}`
}
