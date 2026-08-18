import type { Metadata } from 'next'
import Link from 'next/link'

import { PolicyPage } from '@/components/storefront/policy-page'

export const metadata: Metadata = {
  title: 'About SirajiBD',
  description: 'Learn about SirajiBD, a Bangladesh-focused online store built around clear product information, practical ordering and customer support.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <PolicyPage
      title="About SirajiBD"
      summary="SirajiBD is a Bangladesh-focused online store designed to make everyday shopping clear, practical and easy to understand from product discovery through delivery."
      sections={[
        {
          title: 'What we sell',
          body: (
            <p>SirajiBD offers practical products across categories such as accessories, apparel, electronics and footwear. The active catalogue, prices, availability and product details shown on the store are the current offer presented to customers.</p>
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
          title: 'Bangladesh-first commerce',
          body: (
            <p>The store is configured for customers and delivery addresses in Bangladesh, with prices and checkout choices designed for the local shopping journey. Delivery coverage and current estimates are published on the <Link className="underline" href="/shipping">Shipping & Delivery</Link> page.</p>
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
