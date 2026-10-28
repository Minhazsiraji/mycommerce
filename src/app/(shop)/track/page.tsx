import type { Metadata } from 'next'
import Link from 'next/link'

import { getSteadfastStatus, steadfastPublicTrackingUrl } from '@/modules/shipping'

export const metadata: Metadata = { title: 'Track order', robots: { index: false } }

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code: rawCode } = await searchParams
  const code = rawCode?.trim() ?? ''
  const status = code ? await getSteadfastStatus(code).catch(() => null) : null

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Track your order</h1>
        <p className="mt-2 text-sm text-(--color-muted)">
          Use your courier tracking code, or look up your store order using order number and email.
        </p>
      </div>

      <form method="get" className="storefront-card flex flex-col gap-3 p-5">
        <label htmlFor="tracking-code" className="text-sm font-medium">Steadfast tracking code</label>
        <div className="flex gap-2">
          <input
            id="tracking-code"
            name="code"
            defaultValue={code}
            required
            className="min-h-11 flex-1 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm"
            placeholder="Paste tracking code"
          />
          <button type="submit" className="min-h-11 rounded-md bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-fg)">
            Track
          </button>
        </div>
        {code ? (
          <div className="mt-2 rounded-lg border border-(--color-border) p-3 text-sm">
            <p>Tracking code: <span className="font-medium">{code}</span></p>
            <p className="mt-1 text-(--color-muted)">
              Status: <span className="font-medium capitalize text-(--color-text)">{status?.replaceAll('_', ' ') ?? 'Unable to fetch live status'}</span>
            </p>
            <a href={steadfastPublicTrackingUrl()} target="_blank" rel="noreferrer" className="mt-2 inline-block underline underline-offset-4">
              Open Steadfast tracking page
            </a>
            <p className="mt-1 text-xs text-(--color-muted)">If Steadfast asks for a code, paste the tracking code shown above.</p>
          </div>
        ) : null}
      </form>

      <section className="storefront-card p-5 text-sm">
        <h2 className="font-semibold">Have your MoyMoy order number?</h2>
        <p className="mt-1 text-(--color-muted)">
          For privacy, order lookup requires the order number and the email used at checkout.
        </p>
        <Link href="/orders/lookup" className="mt-3 inline-block font-medium underline underline-offset-4">
          Look up by order number + email
        </Link>
      </section>
    </div>
  )
}
