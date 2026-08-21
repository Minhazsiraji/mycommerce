import type { Metadata } from 'next'

import { PolicyPage } from '@/components/storefront/policy-page'
import { env } from '@/lib/env'
import { STORE_CONFIG, STORE_HOST } from '@/lib/store-config'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact ${STORE_CONFIG.name} for order, delivery, return, payment or general customer-support questions in ${STORE_CONFIG.countryName}.`,
  alternates: { canonical: '/contact' },
}

/**
 * A published support address is the one thing on this page a customer will act
 * on, so the fallback follows the configured domain rather than a literal. On
 * the original store this still resolves to business@sirajibd.com; on a clone it
 * cannot silently hand the client's customers someone else's inbox.
 */
const mailDomain = STORE_HOST.replace(/^www\./, '')

export default function ContactPage() {
  const businessEmail = env.STORE_CONTACT_EMAIL ?? `business@${mailDomain}`
  const adminEmail = env.STORE_ADMIN_EMAIL ?? `admin@${mailDomain}`
  const phone = env.STORE_CONTACT_PHONE
  const address = env.STORE_BUSINESS_ADDRESS

  return (
    <PolicyPage
      title="Contact Us"
      summary={`Use the contact details below for order, delivery, payment, return, privacy or general ${STORE_CONFIG.name} support. Please include your order number when contacting us about an existing order.`}
      sections={[
        {
          title: `${STORE_CONFIG.name} customer support`,
          body: (
            <div className="space-y-2">
              <p>
                Business & customer support:{' '}
                <a className="font-medium underline" href={`mailto:${businessEmail}`}>
                  {businessEmail}
                </a>
              </p>
              <p>
                Administration:{' '}
                <a className="font-medium underline" href={`mailto:${adminEmail}`}>
                  {adminEmail}
                </a>
              </p>
              {phone ? (
                <p>
                  Phone:{' '}
                  <a className="font-medium underline" href={`tel:${phone.replace(/\s+/g, '')}`}>
                    {phone}
                  </a>
                </p>
              ) : (
                <p>Phone support is not currently published. Please use one of the official {STORE_CONFIG.name} email addresses above.</p>
              )}
              {address ? <p>Business address: {address}</p> : null}
            </div>
          ),
        },
        {
          title: 'Which email should I use?',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>{businessEmail}</strong> — orders, delivery, returns, refunds, payments, product questions and general customer support.</li>
              <li><strong>{adminEmail}</strong> — administrative, business, compliance, privacy or account-level matters that are not ordinary order support.</li>
            </ul>
          ),
        },
        {
          title: 'What to include in your message',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Your {STORE_CONFIG.name} order number, if the question relates to an order.</li>
              <li>A short description of the issue and the outcome you are requesting.</li>
              <li>For damaged, defective, wrong or incomplete items, clear photos where useful.</li>
              <li>A reachable contact number or email if it differs from the order details.</li>
            </ul>
          ),
        },
        {
          title: 'Accessibility support',
          body: (
            <p>If a disability, assistive technology or another accessibility need makes it difficult to use part of the store or understand important purchase information, contact us and describe the barrier. We will make a reasonable effort to provide the relevant information or customer-service assistance in an accessible alternative where practical.</p>
          ),
        },
        {
          title: 'Protecting your information',
          body: (
            <p>Do not send passwords, one-time passwords, full payment-card credentials or other authentication secrets by ordinary email, chat or social media. {STORE_CONFIG.name} support should not need those secrets to identify or support an order.</p>
          ),
        },
        {
          title: 'Returns, delivery and privacy requests',
          body: (
            <p>For return eligibility and procedure, review the Returns & Refunds page first. For delivery estimates and charges, review Shipping & Delivery. Privacy-related questions and requests are handled under the Privacy Policy.</p>
          ),
        },
        {
          title: 'Consumer rights',
          body: (
            <p>We encourage customers to contact {STORE_CONFIG.name} first so we can investigate and resolve a concern. This does not prevent a customer from using complaint or consumer-protection channels available under applicable Bangladesh law.</p>
          ),
        },
      ]}
    />
  )
}
