'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { addQuickDenimVariant, startQuickDenim } from '@/modules/orders/actions'
import { taka, QUICK_DENIM_UNIT_PRICE } from '@/lib/moymoy-quick-cod'

type Variant = {
  id: string
  title: string | null
  price: number
  stock: number
  options: Record<string, string>
}

function option(options: Record<string, string>, keys: string[]) {
  return Object.entries(options).find(([k]) => keys.includes(k.trim().toLowerCase()))?.[1]?.trim() ?? ''
}

export function QuickDenimSelector({
  slug,
  title,
  images,
  variants,
  addMode = false,
  returnSlug,
}: {
  slug: string
  title: string
  images: { url: string; alt: string }[]
  variants: Variant[]
  addMode?: boolean
  returnSlug?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const available = useMemo(
    () => variants.filter((v) => v.stock > 0 && v.price === QUICK_DENIM_UNIT_PRICE),
    [variants],
  )
  const hasColors = available.some(v => option(v.options, ['color', 'colour']))
  const [color, setColor] = useState(() => option(available[0]?.options ?? {}, ['color', 'colour']))
  const colors = [...new Set(available.map(v => option(v.options, ['color', 'colour'])).filter(Boolean))]
  const matchingColor = available.filter(v =>
    !hasColors || option(v.options, ['color', 'colour']) === color,
  )
  const [selectedId, setSelectedId] = useState(available[0]?.id ?? '')
  const selected = matchingColor.find(v => v.id === selectedId) ?? matchingColor[0]
  const [photoIndex, setPhotoIndex] = useState(0)
  const gallery = images[photoIndex]

  function proceed() {
    if (!selected) return
    setError('')
    startTransition(async () => {
      // Adding a second product must preserve every existing line. A normal
      // first-purchase selection still begins a fresh Quick COD order.
      const response = addMode
        ? await addQuickDenimVariant({ slug, variantId: selected.id, quantity: 1 })
        : await startQuickDenim({ slug, variantId: selected.id, quantity: 1 })
      if (!response.ok) {
        setError(response.error.message)
        return
      }
      const checkoutSlug = addMode && returnSlug ? returnSlug : slug
      router.push(`/order/denim/checkout?product=${encodeURIComponent(checkoutSlug)}`)
    })
  }

  return (
    <div lang="bn" className="mx-auto max-w-2xl space-y-5 pb-24">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest text-(--color-muted)">MOYMOY FASHION</p>
        {addMode ? <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">আগের প্যান্টগুলো অর্ডারে আছে। এখন আরেকটি কালার ও সাইজ বেছে নিন।</p> : null}
        <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>
        <p className="mt-2 text-3xl font-bold">{taka(QUICK_DENIM_UNIT_PRICE)} <span className="text-base font-medium text-(--color-muted)">/ পিস</span></p>
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">🎁 যেকোনো ২ পিস নিলেই সারা দেশে ডেলিভারি ফ্রি!</p>
      </div>

      {gallery ? (
        <div className="rounded-2xl border border-(--color-border) bg-white p-3">
          {/* Actual uploaded store photos, never recoloured or generated. */}
          <img src={gallery.url} alt={gallery.alt || title} className="mx-auto h-80 w-full object-contain sm:h-[440px]" />
        </div>
      ) : null}
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, i) => (
            <button key={image.url} type="button" onClick={() => setPhotoIndex(i)}
              aria-label={`ছবি ${i + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${i === photoIndex ? 'border-amber-500' : 'border-(--color-border)'}`}>
              <img src={image.url} alt={image.alt || title} className="h-full w-full object-contain"/>
            </button>
          ))}
        </div>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
        {colors.length > 0 && (
          <div>
            <p className="mb-2 font-semibold">১. কালার নির্বাচন করুন</p>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c} type="button" aria-pressed={color === c}
                  onClick={() => {
                    setColor(c)
                    setSelectedId(available.find(v => option(v.options, ['color', 'colour']) === c)?.id ?? '')
                  }}
                  className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${color === c ? 'border-amber-500 bg-amber-50 text-black' : 'border-(--color-border)'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="quick-denim-size" className="mb-2 block font-semibold">{colors.length > 0 ? '২. কোমরের সাইজ নির্বাচন করুন' : '১. সাইজ / ডিজাইন নির্বাচন করুন'}</label>
          <select id="quick-denim-size" value={selected?.id ?? ''} onChange={e => setSelectedId(e.target.value)}
            className="h-12 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 text-base">
            {matchingColor.map(v => (
              <option key={v.id} value={v.id}>{option(v.options, ['size']) || v.title || 'Standard'} — {v.stock} পিস স্টকে</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-(--color-muted)">✅ Cash on Delivery · ১ পিসে ঢাকায় ৳৮০, ঢাকার বাইরে ৳১২০</p>
        {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <button type="button" onClick={proceed} disabled={pending || !selected}
          className="min-h-13 w-full rounded-xl bg-stone-950 px-4 py-4 text-base font-bold text-white disabled:opacity-50">
          {pending ? 'অপেক্ষা করুন…' : addMode ? '＋ অর্ডারে এই প্যান্ট যোগ করুন →' : 'অর্ডার করতে এগিয়ে যান →'}
        </button>
        {addMode && returnSlug ? (
          <Link href={`/order/denim/checkout?product=${encodeURIComponent(returnSlug)}`}
            className="block py-2 text-center text-sm font-semibold text-(--color-muted) underline underline-offset-4">আগের অর্ডারে ফিরে যান</Link>
        ) : null}
      </section>
    </div>
  )
}
