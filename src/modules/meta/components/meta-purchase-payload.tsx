import { META_PURCHASE_ELEMENT_ID, type MetaPurchasePayload } from '../purchase-payload'
import type { MetaCustomData } from '../validators'

/**
 * Publishes Meta Purchase data as inert JSON so reporting does not depend on
 * the order detail subtree hydrating. The hydrated layout-level MetaAnalytics
 * component consumes this block after consent/pixel boot.
 */
export function MetaPurchasePayload({
  eventId,
  data,
}: {
  eventId: string
  data: MetaCustomData
}) {
  const payload: MetaPurchasePayload = { eventId, data }

  return (
    <script
      id={META_PURCHASE_ELEMENT_ID}
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, '\\u003c'),
      }}
    />
  )
}
