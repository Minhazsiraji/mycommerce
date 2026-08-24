/**
 * Public API of the policies module. Server-side only — client components
 * import `./actions` or `./validators` directly.
 */

export {
  deletePolicyPage,
  findPolicyPage,
  listPolicyPages,
  policyReviewStatus,
  upsertPolicyPage,
} from './repository'

export {
  POLICY_LABELS,
  POLICY_SLUGS,
  REQUIRED_POLICY_SLUGS,
  policyParagraphs,
  policyPageInputSchema,
  type PolicySlug,
  type PolicyPageInput,
} from './validators'

export { getPolicySettings, upsertPolicySettings } from './settings-repository'
export {
  DEFAULT_POLICY_SETTINGS,
  refundProcessingText,
  returnWindowText,
  type PolicySettingsValues,
} from './settings-defaults'
export { policySettingsInputSchema, type PolicySettingsInput } from './validators'

export type { PolicyPage } from './schema'
export { PolicyOverride } from './components/policy-override'
