import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import type { Metadata } from 'next'

import { listQuickDenimProducts } from '@/modules/orders'
import { QUICK_DENIM_UNIT_PRICE, taka } from '@/lib/moymoy-quick-cod'
import { storage } from '@/lib/storage'

export const metadata: Metadata = {
  title: 'মেনস ডেনিম অর্ডার | MoyMoy Fashion',
  robots: { index: false, follow: false },
}

export default async function DenimOrderLanding({ searchParams }: {
  searchParams: Promise<{ add?: string; return?: string }>
}) {
  await connection()
  const { add, return: origin } = await searchParams
  const addMode = add === '1' && typeof origin === 'string' && /^[a-z0-9-]{2,180}$/.test(origin)
  const addQuery = addMode ? `?add=1&return=${encodeURIComponent(origin)}` : ''
  const products = await listQuickDenimProducts()

  const onlyProduct = products[0]
  if (products.length === 1 && onlyProduct) redirect(`/order/denim/${onlyProduct.slug}${addQuery}`)

  return (
    <section lang="bn" className="mx-auto max-w-3xl space-y-5 pb-16">
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest text-(--color-muted)">MOYMOY FASHION</p>
        <h1 className="mt-2 text-2xl font-bold">{addMode ? 'আরেকটি প্যান্ট নির্বাচন করুন' : "Men's Semi-Baggy Denim"}</h1>
        {addMode ? (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-semibold">✓ আগের নির্বাচিত প্যান্টগুলো অর্ডারে থাকবে। ছবি দেখে নতুন কালার নির্বাচন করুন।</p>
            <Link href={`/order/denim/checkout?product=${encodeURIComponent(origin)}`}
              className="mt-2 inline-block font-bold underline underline-offset-4">আগের অর্ডারে ফিরে যান</Link>
          </div>
        ) : null}
        <p className="mt-2 text-lg font-semibold">মাত্র {taka(QUICK_DENIM_UNIT_PRICE)} / পিস</p>
        <p className="mt-2 text-sm font-semibold text-emerald-700">২ পিসে সারা দেশে Free Delivery</p>
      </div>
      {products.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center">
          <p className="font-semibold">এই মুহূর্তে ৭৫০ টাকার ডেনিম পণ্য স্টকে পাওয়া যাচ্ছে না।</p>
          <p className="mt-2 text-sm text-(--color-muted)">সঠিক পণ্যের দাম ও স্টক Admin থেকে আপডেট করুন, অথবা Messenger-এ যোগাযোগ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map(p => (
            <Link key={p.id} href={`/order/denim/${p.slug}${addQuery}`}
              className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 shadow-sm">
              {p.images[0] && <img src={storage.url(p.images[0].r2Key, { width: 720, height: 720, fit: 'contain' })}
                className="h-56 w-full rounded-xl bg-white object-contain" alt={p.title} />}
              <h2 className="mt-3 text-lg font-bold">{p.title}</h2>
              <p className="mt-1 font-semibold">{taka(QUICK_DENIM_UNIT_PRICE)}</p>
              <p className="mt-3 rounded-lg bg-stone-950 p-3 text-center font-semibold text-white">কালার ও সাইজ নির্বাচন করুন →</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
