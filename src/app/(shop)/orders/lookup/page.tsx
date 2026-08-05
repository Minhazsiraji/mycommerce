import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { GuestLookupForm } from '@/modules/orders/components/guest-lookup-form'

export const metadata: Metadata = {
  title: 'Find your order',
  robots: { index: false },
}

/**
 * Reading `searchParams` makes this per-request, so it sits behind its own
 * boundary — the heading and the form's markup still prerender, and only the
 * prefilled value waits.
 */
async function PrefilledForm({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  // Present when someone follows a link from a confirmation page whose viewing
  // cookie has since expired.
  const { order } = await searchParams
  return <GuestLookupForm defaultOrderNumber={order} />
}

export default function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Find your order</h1>
        <p className="text-sm text-(--color-muted)">
          Enter the order number from your confirmation email, along with the email address you
          ordered with.
        </p>
      </div>

      <Suspense fallback={<GuestLookupForm />}>
        <PrefilledForm searchParams={searchParams} />
      </Suspense>

      <p className="text-sm text-(--color-muted)">
        Have an account?{' '}
        <Link href="/account/orders" className="underline underline-offset-4">
          See all your orders
        </Link>
      </p>
    </div>
  )
}
