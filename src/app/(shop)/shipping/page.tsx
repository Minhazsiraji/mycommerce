import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'

import { PolicyPage } from '@/components/storefront/policy-page'
import { formatBdt } from '@/lib/money'
import { STORE_CONFIG } from '@/lib/store-config'
import { getCachedDeliverySummary } from '@/modules/shipping'

export const metadata: Metadata = {
  title: 'Shipping & Delivery',
  description: `See ${STORE_CONFIG.name} delivery coverage, current delivery estimates, shipping charges and delivery guidance for ${STORE_CONFIG.countryName}.`,
  alternates: { canonical: '/shipping' },
}

export default async function ShippingPage() {
  await connection()

  const result = await getCachedDeliverySummary().catch(() => ({ freeOver: null, estimate: null }))
  const estimate = result.estimate
  const estimateText = estimate
    ? estimate.min === estimate.max
      ? `${estimate.min} day${estimate.min === 1 ? '' : 's'}`
      : `${estimate.min}–${estimate.max} days`
    : 'the estimate shown at checkout'

  return (
    <PolicyPage
      title="Shipping & Delivery"
      summary={`${STORE_CONFIG.name} delivers eligible orders within ${STORE_CONFIG.countryName}. Delivery options, charges and estimates are shown before you place an order.`}
      sections={[
        {
          title: 'Delivery coverage',
          body: (
            <p>We currently offer delivery to supported addresses in Bangladesh. Available delivery options are determined from the delivery address you enter at checkout. If no active delivery option covers an address, checkout will tell you before the order is placed.</p>
          ),
        },
        {
          title: 'Current delivery estimate',
          body: (
            <>
              <p>Based on the delivery options currently configured in the store, the standard estimate is <strong>{estimateText}</strong>. The estimate attached to the delivery option you select at checkout is the estimate that applies to that order.</p>
              <p>Delivery times are estimates, not guaranteed appointment times. Weather, public holidays, courier capacity, remote locations, address problems or other events outside reasonable control can cause delays.</p>
            </>
          ),
        },
        {
          title: 'Delivery charges and free-delivery offers',
          body: (
            <>
              <p>Shipping charges are calculated from the active delivery option and shown in the order total before you place the order.</p>
              {result.freeOver ? (
                <p>The store currently has a free-delivery threshold starting at <strong>{formatBdt(result.freeOver)}</strong> for eligible orders or delivery options. The checkout total is the authoritative charge for your specific order.</p>
              ) : (
                <p>If a free-delivery offer is available, its eligibility and resulting charge will be shown on the storefront or at checkout before you order.</p>
              )}
            </>
          ),
        },
        {
          title: 'Processing and shipment',
          body: (
            <p>We begin processing after an order is accepted and any required payment or verification step is complete. When fulfilment has progressed too far for cancellation, the order may need to follow the return process after delivery.</p>
          ),
        },
        {
          title: 'Address accuracy and failed delivery',
          body: (
            <>
              <p>Please provide a complete and reachable delivery address and phone number. If an address is incomplete or the courier cannot reasonably complete delivery, we may contact you for clarification or arrange another attempt where available.</p>
              <p>Additional delivery costs caused by an incorrect address, repeated customer-requested attempts or a customer-requested reroute may be charged only when communicated before the additional service is accepted.</p>
            </>
          ),
        },
        {
          title: 'Receiving your order',
          body: (
            <p>When practical, check the parcel and product promptly after delivery. If the item is damaged, defective, wrong or incomplete, contact us as soon as possible and follow the <Link className="underline" href="/returns">Returns & Refunds</Link> process.</p>
          ),
        },
        {
          title: 'Keeping shipping information accurate',
          body: (
            <p>Delivery settings can change as courier coverage, costs or service levels change. {STORE_CONFIG.name} uses the active checkout delivery options as the source of truth for a new order, and this page reads the current store-level estimate so customer-facing information remains aligned.</p>
          ),
        },
      ]}
    />
  )
}
