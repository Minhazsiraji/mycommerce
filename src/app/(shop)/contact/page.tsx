import type { Metadata } from 'next'

import { PolicyPage } from '@/components/storefront/policy-page'
import { env } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact SirajiBD for order, delivery, return, payment or general customer-support questions in Bangladesh.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  const email = env.STORE_CONTACT_EMAIL
  const phone = env.STORE_CONTACT_PHONE
  const address = env.STORE_BUSINESS_ADDRESS

  return (
    <PolicyPage
      title="Contact Us"
      summary="Use the contact details below for order, delivery, payment, return, privacy or general SirajiBD support. Please include your order number when contacting us about an existing order."
      sections={[
        {
          title: 'SirajiBD customer support',
          body: (
            <div className="space-y-2">
              {email ? (
                <p>
                  Email:{' '}
                  <a className="font-medium underline" href={`mailto:${email}`}>
                    {email}
                  </a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  Phone:{' '}
                  <a className="font-medium underline" href={`tel:${phone.replace(/\s+/g, '')}`}>
                    {phone}
                  </a>
                </p>
              ) : null}
              {address ? <p>Business address: {address}</p> : null}
              {!email && !phone ? (
                <p>Direct customer-support details are being configured. Until they are published here, please do not send sensitive payment information through unofficial channels.</p>
              ) : null}
            </div>
          ),
        },
        {
          title: 'What to include in your message',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Your SirajiBD order number, if the question relates to an order.</li>
              <li>A short description of the issue and the outcome you are requesting.</li>
              <li>For damaged, defective, wrong or incomplete items, clear photos where useful.</li>
              <li>A reachable contact number or email if it differs from the order details.</li>
            </ul>
          ),
        },
        {
          title: 'Protecting your information',
          body: (
            <p>Do not send passwords, one-time passwords, full payment-card credentials or other authentication secrets by ordinary email, chat or social media. SirajiBD support should not need those secrets to identify or support an order.</p>
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
            <p>We encourage customers to contact SirajiBD first so we can investigate and resolve a concern. This does not prevent a customer from using complaint or consumer-protection channels available under applicable Bangladesh law.</p>
          ),
        },
      ]}
    />
  )
}
