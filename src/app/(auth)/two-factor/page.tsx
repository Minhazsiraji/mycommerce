import type { Metadata } from 'next'
import { Suspense } from 'react'

import { TwoFactorChallenge } from '@/modules/accounts/components/two-factor-challenge'

export const metadata: Metadata = { title: 'Two-step verification', robots: { index: false } }

/** Reading searchParams is per-request, so it gets its own boundary. */
async function Challenge({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <TwoFactorChallenge next={next} />
}

export default function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <Suspense fallback={<TwoFactorChallenge />}>
      <Challenge searchParams={searchParams} />
    </Suspense>
  )
}
