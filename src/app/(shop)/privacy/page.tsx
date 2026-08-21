import type { Metadata } from 'next'
import Link from 'next/link'

import { PolicyPage } from '@/components/storefront/policy-page'
import { STORE_CONFIG } from '@/lib/store-config'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Learn how ${STORE_CONFIG.name} handles account, order, delivery, payment, cookie and analytics information.`,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      summary={`This policy explains what information ${STORE_CONFIG.name} uses to operate the store, fulfil orders, keep accounts secure and measure the shopping experience.`}
      sections={[
        {
          title: 'Information we collect',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Account information such as your name, email address and account-security records when you create or use an account.</li>
              <li>Order and delivery information such as name, phone number, email, delivery address, district, city or area, selected delivery option and order notes.</li>
              <li>Order, cart, payment-status, refund and customer-support records needed to complete and support transactions.</li>
              <li>Technical information needed for security, fraud prevention, sessions and service operation, such as browser, device, IP-address and cookie/session information.</li>
              <li>Optional analytics information when you allow optional analytics through the privacy choices shown on the site.</li>
            </ul>
          ),
        },
        {
          title: 'Why we use information',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>To provide the storefront, cart, account and checkout.</li>
              <li>To process, deliver, track, cancel, return and refund orders.</li>
              <li>To send transactional messages and respond to customer-support requests.</li>
              <li>To protect customers and {STORE_CONFIG.name} against abuse, fraud and security incidents.</li>
              <li>To maintain records reasonably needed for accounting, dispute handling, compliance and service improvement.</li>
              <li>To measure shopping and advertising performance where the relevant analytics or integration is enabled and permitted.</li>
            </ul>
          ),
        },
        {
          title: 'Payments',
          body: (
            <p>Depending on the payment option you choose, payment information may be processed by a payment gateway, bank or mobile financial service. Those providers process information under their own terms and privacy practices. {STORE_CONFIG.name} keeps the transaction and payment-status information needed to manage the order, reconciliation, refunds and support.</p>
          ),
        },
        {
          title: 'Cookies, sessions and analytics choices',
          body: (
            <>
              <p>Essential cookies or similar storage are used where necessary to keep features such as sessions, account security, cart and checkout working.</p>
              <p>Optional browser analytics, including Meta Pixel and Google measurement when configured, are activated only after you choose to allow analytics. You can revisit the site’s Privacy choices control to change that optional browser-analytics choice.</p>
              <p>Where a server-side conversion integration is configured, limited order/conversion information may also be sent for measurement and attribution subject to the store’s settings and applicable requirements. Identifiers are normalised or hashed where the integration requires it.</p>
            </>
          ),
        },
        {
          title: 'Transactional and marketing communications',
          body: (
            <>
              <p>Order confirmations, payment notices, delivery updates, return/refund messages, account-security notices and replies to support requests are transactional communications needed to provide or protect the service.</p>
              <p>{STORE_CONFIG.name} will not treat an order email address or phone number as blanket permission for unrelated promotional messaging. If optional marketing subscriptions are introduced, the signup purpose and available unsubscribe or opt-out method should be disclosed at the point of collection.</p>
            </>
          ),
        },
        {
          title: 'Service providers and sharing',
          body: (
            <>
              <p>We may share only the information reasonably needed with providers that support hosting, database services, image delivery, email, payments, fraud prevention, analytics, advertising measurement, shipping or customer support.</p>
              <p>We do not sell customers’ contact information. We do not use a customer’s personal information or image in advertising without the permission required for that use.</p>
              <p>Information may also be disclosed where reasonably necessary to comply with law, enforce rights, protect users or respond to a lawful request.</p>
            </>
          ),
        },
        {
          title: 'Retention and security',
          body: (
            <>
              <p>We keep information only for as long as reasonably needed for the purposes described above, including fulfilment, support, fraud prevention, accounting, disputes, legal obligations and backup recovery.</p>
              <p>{STORE_CONFIG.name} uses technical and organisational safeguards appropriate to the service, including HTTPS for the storefront and checkout. No internet service can guarantee absolute security, so customers should also protect their account credentials and devices.</p>
            </>
          ),
        },
        {
          title: 'Your choices and requests',
          body: (
            <>
              <p>You can use account controls available on the site to manage supported account information and security settings. You can also contact us to ask about access, correction or deletion of personal information where applicable and technically or legally available.</p>
              <p>For privacy questions or requests, use the <Link className="underline" href="/contact">Contact Us</Link> page. We may need to verify your identity before acting on a request that affects account or order data.</p>
            </>
          ),
        },
        {
          title: 'Changes to this policy',
          body: (
            <p>We may update this policy when our services, providers or legal obligations change. The date at the top of this page identifies the latest published version. Material changes should be reflected here before or when the updated practice takes effect.</p>
          ),
        },
      ]}
    />
  )
}
