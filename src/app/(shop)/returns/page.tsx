import type { Metadata } from 'next'
import Link from 'next/link'

import { PolicyPage } from '@/components/storefront/policy-page'

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Read SirajiBD return, exchange, cancellation and refund terms for orders delivered in Bangladesh.',
  alternates: { canonical: '/returns' },
}

export default function ReturnsPage() {
  return (
    <PolicyPage
      title="Returns & Refunds"
      summary="We want return and refund decisions to be predictable. This policy explains the standard SirajiBD process for eligible orders delivered in Bangladesh."
      sections={[
        {
          title: '7-day return window',
          body: (
            <>
              <p>You may request a return within 7 calendar days after the order is delivered.</p>
              <p>The item should be unused, unworn, unwashed and in substantially the same condition in which it was delivered, with its original packaging, tags, accessories, manuals and included items where applicable.</p>
            </>
          ),
        },
        {
          title: 'Damaged, defective, wrong or incomplete orders',
          body: (
            <>
              <p>If an item arrives damaged, defective, materially different from the ordered item, or with included parts missing, contact us promptly through the <Link className="underline" href="/contact">Contact Us</Link> page.</p>
              <p>For an approved claim caused by SirajiBD or fulfilment error, we will arrange an appropriate replacement, exchange or refund and cover the reasonable return delivery cost.</p>
            </>
          ),
        },
        {
          title: 'Change-of-mind returns',
          body: (
            <>
              <p>Eligible unused items may also be returned within the 7-day window when you simply change your mind.</p>
              <p>For a change-of-mind return, the customer is responsible for the return delivery cost. The original delivery charge is not refundable unless the return is due to a SirajiBD or fulfilment error.</p>
            </>
          ),
        },
        {
          title: 'Items that may not be returnable',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Items used, worn, washed, altered or damaged after delivery.</li>
              <li>Items returned without essential original parts, accessories or packaging when that prevents safe resale.</li>
              <li>Products that cannot be returned for hygiene, health or safety reasons after their protective seal has been opened, where clearly disclosed before purchase.</li>
              <li>Any other item specifically identified as non-returnable on its product page before purchase, subject to applicable law.</li>
            </ul>
          ),
        },
        {
          title: 'How to request a return',
          body: (
            <ol className="list-decimal space-y-2 pl-5">
              <li>Contact SirajiBD within the return window and provide the order number and reason for return.</li>
              <li>For damaged, defective, wrong or incomplete products, provide clear photos or other reasonable evidence if requested.</li>
              <li>Wait for return instructions before sending the item. Unauthorised parcels may be difficult to identify or process.</li>
              <li>Pack the item securely and follow the courier or drop-off instructions we provide.</li>
            </ol>
          ),
        },
        {
          title: 'Exchanges',
          body: (
            <p>We may offer an exchange where the requested replacement is available. If a suitable replacement is unavailable, an approved return will be handled as a refund.</p>
          ),
        },
        {
          title: 'Refund timing and method',
          body: (
            <>
              <p>After we receive and inspect an approved return, we aim to initiate the refund within 5–7 business days. Banks, card networks and payment providers may need additional time to make the funds visible to you.</p>
              <p>Where practical, refunds are sent back through the original payment method. For cash-on-delivery or cases where the original route cannot receive a refund, we may use a verified bank account or supported mobile financial service after confirming the recipient details.</p>
            </>
          ),
        },
        {
          title: 'Order cancellation',
          body: (
            <p>You may ask to cancel an order before it has been shipped. Once an order has entered shipment, the applicable return process above will normally apply.</p>
          ),
        },
        {
          title: 'Your legal rights',
          body: (
            <p>This policy is our standard commercial policy. Nothing in it is intended to exclude or limit rights or remedies that cannot lawfully be excluded under applicable Bangladesh consumer-protection or digital-commerce rules.</p>
          ),
        },
      ]}
    />
  )
}
