/**
 * Re-checks a success-return page until the independently verified IPN lands.
 *
 * A `<meta http-equiv="refresh">` rather than a timer in a client component.
 * `PaymentStatusRefresh` does exactly this job with `router.refresh()` and never
 * runs, because the order page's subtree does not hydrate — the same fault that
 * stopped the purchase event firing. A customer coming back from SSLCommerz
 * therefore sat on "Payment received — confirming" forever, and because the page
 * never re-rendered into its paid state, no purchase was ever reported for a
 * sale that had genuinely completed.
 *
 * Inert markup has no such dependency: the browser honours it whether or not
 * React ever wakes up. React 19 hoists it into `<head>` from wherever it is
 * rendered.
 *
 * The attempt counter travels in the URL because there is nowhere else to keep
 * it — each refresh is a fresh document. Without the bound, an IPN that never
 * arrives would reload the page forever.
 */
const MAX_ATTEMPTS = 5
const SECONDS_BETWEEN = 3

export function PaymentConfirmingRefresh({
  orderNumber,
  attempt,
}: {
  orderNumber: string
  attempt: number
}) {
  if (attempt >= MAX_ATTEMPTS) return null

  const next = new URLSearchParams({ payment: 'success', c: String(attempt + 1) })

  return (
    <meta
      httpEquiv="refresh"
      content={`${SECONDS_BETWEEN};url=/orders/${encodeURIComponent(orderNumber)}?${next}`}
    />
  )
}

/** Exported for the page's bounds check and for tests. */
export const PAYMENT_CONFIRM_MAX_ATTEMPTS = MAX_ATTEMPTS
