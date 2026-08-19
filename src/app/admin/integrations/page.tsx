import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Integrations' }

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted)">
          Configure store-specific measurement destinations here. Client clones should use their own Meta and Google identifiers rather than editing application code.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IntegrationCard href="/admin/integrations/meta" title="Meta" detail="Pixel, Conversions API, encrypted server token, connection health and event delivery." />
        <IntegrationCard href="/admin/integrations/google" title="Google" detail="Consent-gated Google tag and confirmed-purchase measurement for Merchant Center and related Google products." />
      </div>
    </div>
  )
}

function IntegrationCard({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link href={href} className="rounded-xl border border-(--color-border) p-5 transition hover:bg-(--color-surface)">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-(--color-muted)">{detail}</p>
      <p className="mt-4 text-sm font-medium">Manage →</p>
    </Link>
  )
}
