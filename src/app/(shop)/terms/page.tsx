import type { Metadata } from 'next'
import Link from 'next/link'

import { PolicyPage } from '@/components/storefront/policy-page'
import { STORE_CONFIG, STORE_HOST } from '@/lib/store-config'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Read the terms that apply when using ${STORE_CONFIG.name}, placing orders and purchasing products through the store.`,
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      summary={`These terms govern use of ${STORE_HOST} and purchases made through the ${STORE_CONFIG.name} online store. Separate policies linked below form part of the customer information for an order.`}
      sections={[
        {
          title: `Using ${STORE_CONFIG.name}`,
          body: (
            <>
              <p>You may use the store for lawful personal shopping and related account or order activities. Do not misuse the service, interfere with its security, attempt unauthorised access, submit fraudulent orders or use the store in a way that harms other customers or the service.</p>
              <p>You are responsible for keeping your account credentials and devices reasonably secure and for information submitted through your account.</p>
            </>
          ),
        },
        {
          title: 'Products and information',
          body: (
            <p>We aim to present product names, descriptions, images, availability and prices accurately. Screen colours, packaging and minor presentation details can vary. If a material product detail is incorrect, we may correct the listing and, where an affected order has already been placed, contact the customer with an appropriate option.</p>
          ),
        },
        {
          title: 'Prices, stock and order acceptance',
          body: (
            <>
              <p>Prices and delivery charges shown in the checkout total are presented in the store currency. Product availability remains subject to stock confirmation.</p>
              <p>Submitting an order is a request to purchase. We may decline or cancel an order before fulfilment when stock is unavailable, payment or verification fails, there is an obvious pricing or listing error, the order appears fraudulent, or fulfilment would be unlawful or impossible. If money has already been collected for a cancelled order, an appropriate refund will be arranged.</p>
            </>
          ),
        },
        {
          title: 'Payment',
          body: (
            <p>Available payment methods are shown at checkout and may include cash on delivery, bank transfer or a supported payment gateway. Third-party payment providers may apply their own terms. Never send card credentials or other sensitive payment secrets through ordinary email or social messages.</p>
          ),
        },
        {
          title: 'Shipping, cancellation, returns and refunds',
          body: (
            <p>Delivery is governed by our <Link className="underline" href="/shipping">Shipping & Delivery</Link> information. Cancellations, returns, exchanges and refunds are governed by our <Link className="underline" href="/returns">Returns & Refunds</Link> policy. Those pages should be reviewed before purchase because they contain the applicable procedures, timeframes and cost responsibilities.</p>
          ),
        },
        {
          title: 'Warranty and product support',
          body: (
            <>
              <p>{STORE_CONFIG.name} does not promise a blanket manufacturer or extended warranty for every product. If a product has a specific seller, manufacturer or service warranty, the applicable duration and material conditions should be stated on the product page or otherwise disclosed before purchase.</p>
              <p>A product-specific warranty does not replace the return process for an item that arrives damaged, defective, wrong or incomplete, and nothing here limits rights that cannot lawfully be excluded.</p>
            </>
          ),
        },
        {
          title: 'Promotions and offers',
          body: (
            <p>Promotions may have stated eligibility, stock, time or usage limits. We may correct an obvious promotional error or end an offer prospectively, but we will not use undisclosed conditions to change a completed customer decision after the fact.</p>
          ),
        },
        {
          title: 'Intellectual property',
          body: (
            <p>The {STORE_CONFIG.name} branding, site design, original text, graphics and other protected store materials may not be copied or commercially reused without permission except where applicable law allows it. Product or third-party names and marks remain the property of their respective owners.</p>
          ),
        },
        {
          title: 'Service availability and responsibility',
          body: (
            <p>We work to keep the store reliable and secure, but online services can experience maintenance, network failures or third-party disruptions. Nothing in these terms excludes responsibility or customer rights that cannot lawfully be excluded. Any limitation applied under these terms is subject to applicable Bangladesh law.</p>
          ),
        },
        {
          title: 'Privacy',
          body: (
            <p>How we handle customer and technical information is described in the <Link className="underline" href="/privacy">Privacy Policy</Link>.</p>
          ),
        },
        {
          title: 'Applicable law and resolving concerns',
          body: (
            <>
              <p>These terms are intended to operate under the laws and applicable digital-commerce and consumer-protection rules of Bangladesh.</p>
              <p>If you have a concern, contact us first through the <Link className="underline" href="/contact">Contact Us</Link> page so we can try to resolve it. Nothing in these terms prevents a customer from using rights or complaint channels available under applicable law.</p>
            </>
          ),
        },
        {
          title: 'Changes to these terms',
          body: (
            <p>We may update these terms to reflect changes in the store, policies or applicable requirements. The version published when you place an order will not be silently rewritten to change the disclosed conditions of that completed transaction.</p>
          ),
        },
      ]}
    />
  )
}
