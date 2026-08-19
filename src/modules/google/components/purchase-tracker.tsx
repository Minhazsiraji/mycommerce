import {
  GOOGLE_PURCHASE_ELEMENT_ID,
  buildGooglePurchasePayload,
  type PurchaseEligibleOrder,
} from '../purchase-event'

/**
 * Publishes the purchase payload as inert JSON for the Google tag to pick up.
 *
 * This used to be a `'use client'` component that emitted the event from a
 * `useEffect`. It never fired. The component rendered with correct props — the
 * markup was in the document and its chunk was in the browser bundle — but the
 * order page's subtree does not hydrate, so the effect never ran. An `onClick`
 * placed on it during the investigation was equally dead, which is what proved
 * it was a rendering problem rather than a tracking one. The same fault silently
 * disables Meta's `PurchaseTracker`, `PayNowButton` and `PaymentStatusRefresh`
 * on that page.
 *
 * So this no longer depends on hydration at all. A `<script type="application/
 * json">` block is inert markup: the browser parses it, never executes it, and
 * it is readable from the DOM the instant the HTML lands. `GoogleAnalytics` —
 * which lives in the shop layout and demonstrably does hydrate, since
 * `page_view` has always worked — reads it and emits the event.
 *
 * Rendering nothing when the order is ineligible is the point: an absent block
 * is what stops COD, unpaid, failed and cancelled orders reporting a purchase.
 */
export function GooglePurchaseTracker({
  enabled,
  order,
}: {
  enabled: boolean
  order: PurchaseEligibleOrder
}) {
  const payload = buildGooglePurchasePayload(order, { enabled })
  if (!payload) return null

  return (
    <script
      id={GOOGLE_PURCHASE_ELEMENT_ID}
      type="application/json"
      // Escaped so a product title containing `</script>` cannot break out of
      // the block. The content is data the browser never executes.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, '\\u003c'),
      }}
    />
  )
}
