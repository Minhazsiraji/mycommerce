import type { Metadata } from 'next'
import Link from 'next/link'

import { PolicyPage } from '@/components/storefront/policy-page'
import { STORE_CONFIG } from '@/lib/store-config'

export const metadata: Metadata = {
  title: `About ${STORE_CONFIG.name}`,
  description: `Learn about ${STORE_CONFIG.name}, a ${STORE_CONFIG.countryName}-focused online store built around clear product information, practical ordering and customer support.`,
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <PolicyPage
      title={`About ${STORE_CONFIG.name}`}
      summary={`${STORE_CONFIG.name} is a ${STORE_CONFIG.countryName}-focused online store designed to make everyday shopping clear, practical and easy to understand from product discovery through delivery.`}
      sections={[
        {
          title: 'What we sell',
          body: (
            <p>{STORE_CONFIG.name} offers practical products across categories such as accessories, apparel, electronics and footwear. The active catalogue, prices, availability and product details shown on the store are the current offer presented to customers.</p>
          ),
        },
        {
          title: 'How we want shopping to feel',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Clear prices and product information before checkout.</li>
              <li>Visible delivery options and charges before an order is placed.</li>
              <li>Accessible return, refund, privacy and contact information.</li>
              <li>A checkout that supports ordinary individual customers without unnecessary business-only requirements.</li>
              <li>Order records and support paths customers can understand after purchase.</li>
            </ul>
          ),
        },
        {
          title: `${STORE_CONFIG.countryName}-first commerce`,
          body: (
            <p>The store is configured for customers and delivery addresses in {STORE_CONFIG.countryName}, with prices and checkout choices designed for the local shopping journey. Delivery coverage and current estimates are published on the <Link className="underline" href="/shipping">Shipping & Delivery</Link> page.</p>
          ),
        },
        {
          title: 'Trust and transparency',
          body: (
            <p>We aim to publish only business, product and service claims we can support, to disclose material purchase conditions before checkout, and to correct meaningful errors when we identify them. Current store policies are linked throughout the customer journey so they are available before and after an order.</p>
          ),
        },
        {
          title: 'Need help?',
          body: (
            <p>For an order question, return request, delivery issue or general enquiry, use the <Link className="underline" href="/contact">Contact Us</Link> page.</p>
          ),
        },
      ]}
    />
  )
}
