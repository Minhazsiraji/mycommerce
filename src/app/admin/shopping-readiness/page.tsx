import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'

import { getDiscoveryReadiness } from '@/modules/catalog'

export const metadata: Metadata = { title: 'AI shopping readiness' }

export default async function ShoppingReadinessPage() {
  await connection()
  const rows = await getDiscoveryReadiness()
  const eligible = rows.filter(({ product }) => product.discoveryEligible)
  const ready = rows.filter((row) => row.ready)

  return <div className="flex flex-col gap-8">
    <div>
      <h1 className="text-2xl font-semibold">AI shopping readiness</h1>
      <p className="mt-2 max-w-3xl text-sm text-(--color-muted)">
        Technical preparation for product discovery. This does not mean OpenAI approval,
        certification, guaranteed listing, or direct ChatGPT checkout.
      </p>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat label="All products" value={rows.length} />
      <Stat label="Included by merchant" value={eligible.length} />
      <Stat label="Ready to export" value={ready.length} />
    </div>
    <div className="flex flex-wrap gap-3">
      <a href="/admin/shopping-readiness/feed" className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-white">Download validated CSV</a>
      <span className="self-center text-xs text-(--color-muted)">Only active, eligible products with no blocking issues are exported.</span>
    </div>
    <section className="overflow-x-auto rounded-xl border border-(--color-border)">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-(--color-border)">
        <th className="p-3">Product</th><th className="p-3">Included</th><th className="p-3">Readiness</th><th className="p-3">Action</th>
      </tr></thead><tbody>{rows.map(({ product, issues, ready: isReady }) => <tr key={product.id} className="border-b border-(--color-border) last:border-0">
        <td className="p-3 font-medium">{product.title}</td>
        <td className="p-3">{product.discoveryEligible ? 'Yes' : 'No'}</td>
        <td className="p-3">{isReady ? <span className="text-green-700">Ready</span> : issues.length ? issues.join('; ') : 'Excluded by merchant'}</td>
        <td className="p-3"><Link className="underline underline-offset-4" href={`/admin/products/${product.id}`}>Edit</Link></td>
      </tr>)}</tbody></table>
    </section>
    <section className="rounded-xl border border-(--color-border) p-4 text-sm">
      <h2 className="font-semibold">External steps still required</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-(--color-muted)">
        <li>Complete and publish accurate privacy, terms, shipping, returns, and refund policies.</li>
        <li>Apply through the relevant merchant onboarding channel and follow its current feed specification.</li>
        <li>Keep product price, stock, links, and policy information current.</li>
      </ul>
    </section>
  </div>
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-(--color-border) p-4"><div className="text-2xl font-semibold">{value}</div><div className="text-sm text-(--color-muted)">{label}</div></div>
}
