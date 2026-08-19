export type GoogleSettingsRow = {
  trackingEnabled: boolean
  tagId: string | null
  purchaseTrackingEnabled: boolean
}

/**
 * What the admin form starts with before anything has been saved.
 *
 * Pure and dependency-free so it can be tested directly — `integration-config`
 * pulls in `env`, which is unavailable to the test runner.
 *
 * Purchase measurement defaults ON, matching the column default, and
 * deliberately does NOT derive from the effective config. Deriving it was the
 * bug: with no saved row and no `NEXT_PUBLIC_GOOGLE_TAG_ID` — exactly a fresh
 * Preview — the effective value is necessarily false, because it is computed
 * from a tag that does not exist yet. The form then opened with the box
 * unticked, and the first save persisted `false` for an operator who was
 * setting Google up precisely in order to measure purchases.
 *
 * Tracking itself still defaults off: turning analytics on is a decision the
 * operator has to make. Once made, measuring purchases is the expected
 * consequence, not a second opt-in they have to notice.
 */
export function googleAdminFormDefaults(
  settings: GoogleSettingsRow | null | undefined,
  effective: { enabled: boolean },
) {
  return {
    trackingEnabled: settings?.trackingEnabled ?? effective.enabled,
    tagId: settings?.tagId ?? '',
    purchaseTrackingEnabled: settings?.purchaseTrackingEnabled ?? true,
  }
}
