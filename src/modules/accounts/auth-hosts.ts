function hostname(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    return new URL(value.includes('://') ? value : `https://${value}`).host
  } catch {
    return null
  }
}

/**
 * Exact hosts this build is allowed to serve authentication from.
 *
 * Vercel injects the immutable deployment and branch URLs. Using those exact
 * values keeps Preview authentication same-origin without trusting every
 * unrelated `*.vercel.app` deployment.
 */
export function authAllowedHosts(input: {
  canonicalUrl: string
  publicUrl?: string | null
  vercelUrl?: string | null
  vercelBranchUrl?: string | null
  vercelProductionUrl?: string | null
}) {
  return [
    hostname(input.canonicalUrl),
    hostname(input.publicUrl),
    hostname(input.vercelUrl),
    hostname(input.vercelBranchUrl),
    hostname(input.vercelProductionUrl),
  ].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index)
}
