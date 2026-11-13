'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { BD_DISTRICTS, bdAreasFor, bdCitiesFor } from '@/lib/bd-locations'
import { QUICK_DENIM_UNIT_PRICE, QUICK_DENIM_MAX_ITEMS, quickDenimShipping, taka } from '@/lib/moymoy-quick-cod'
import { updateLineQuantity, removeLine } from '@/modules/cart/actions'
import { addQuickDenimVariant, placeQuickDenimCod } from '@/modules/orders/actions'
import { trackInitiateCheckout } from '@/modules/meta/actions'

type Line = {
  id: string
  variantId: string
  variantTitle: string | null
  quantity: number
  stock: number
  unitPrice: number
}
type Variant = {
  id: string
  title: string | null
  stock: number
  price: number
  options: Record<string, string>
}

function label(v: Variant) {
  const color = Object.entries(v.options).find(([key]) => ['color', 'colour'].includes(key.toLowerCase()))?.[1]
  const size = Object.entries(v.options).find(([key]) => key.toLowerCase() === 'size')?.[1]
  return [color, size].filter(Boolean).join(' / ') || v.title || 'Standard'
}

export function QuickDenimCheckout({
  slug, lines, variants,
}: { slug: string; lines: Line[]; variants: Variant[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [district, setDistrict] = useState('')
  const [thanaKey, setThanaKey] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const availableVariants = variants.filter(v => v.stock > 0 && v.price === QUICK_DENIM_UNIT_PRICE)
  const [extraId, setExtraId] = useState(availableVariants[0]?.id ?? '')
  const initiated = useRef(false)

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    void trackInitiateCheckout({})
  }, [])

  const thanaChoices = useMemo(() => {
    if (!district) return []
    const rows = bdCitiesFor(district).flatMap(city =>
      bdAreasFor(district, city).map(upazila => ({
        key: `${city}::${upazila}`, city, upazila,
      })),
    )
    return rows.filter((row, i) => rows.findIndex(r => r.key === row.key) === i)
  }, [district])
  const chosenArea = thanaChoices.find(row => row.key === thanaKey)

  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const shipping = district && chosenArea
    ? quickDenimShipping(count, district, chosenArea.city).cost
    : count >= 2 ? 0 : null
  const total = shipping === null ? null : subtotal + shipping
  const disabled = pending || !chosenArea || count < 1 || count > QUICK_DENIM_MAX_ITEMS

  function changeQuantity(id: string, quantity: number) {
    setError('')
    startTransition(async () => {
      const response = quantity > 0
        ? await updateLineQuantity({ lineId: id, quantity })
        : await removeLine({ lineId: id })
      if (!response.ok) return setError(response.error.message)
      router.refresh()
    })
  }

  function addAnother() {
    if (!extraId || count >= QUICK_DENIM_MAX_ITEMS) return
    setError('')
    startTransition(async () => {
      const response = await addQuickDenimVariant({ slug, variantId: extraId, quantity: 1 })
      if (!response.ok) return setError(response.error.message)
      router.refresh()
    })
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (disabled || !chosenArea) return
    setError('')
    startTransition(async () => {
      const result = await placeQuickDenimCod({
        slug,
        email,
        address: {
          recipient: name,
          phone,
          line1: address,
          line2: '',
          district,
          city: chosenArea.city,
          upazila: chosenArea.upazila,
          country: 'BD',
          union: '',
          postalCode: '',
        },
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      router.push(`/order/denim/thanks/${encodeURIComponent(result.data.orderNumber)}`)
    })
  }

  return (
    <div lang="bn" className="mx-auto max-w-2xl space-y-5 pb-28">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest text-(--color-muted)">MOYMOY FASHION</p>
        <h1 className="mt-2 text-2xl font-bold">আপনার অর্ডার সম্পন্ন করুন</h1>
        <p className="mt-2 text-sm text-(--color-muted)">কোনো অ্যাকাউন্ট বা অগ্রিম পেমেন্টের প্রয়োজন নেই</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">👖 নির্বাচিত প্যান্ট</h2>
          <Link className="text-sm font-medium underline" href={`/order/denim/${slug}`}>পরিবর্তন করুন</Link>
        </div>
        {lines.map(line => (
          <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-(--color-border) pb-3 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{variants.find(v => v.id === line.variantId) ? label(variants.find(v => v.id === line.variantId)!) : line.variantTitle || 'ডেনিম প্যান্ট'}</p>
              <p className="text-sm text-(--color-muted)">{taka(line.unitPrice)} × {line.quantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="একটি কমান" type="button" disabled={pending} onClick={() => changeQuantity(line.id, line.quantity - 1)}
                className="h-11 w-11 rounded-lg border border-(--color-border) text-xl">−</button>
              <span className="min-w-5 text-center font-bold">{line.quantity}</span>
              <button aria-label="একটি বাড়ান" type="button"
                disabled={pending || line.quantity >= line.stock || count >= QUICK_DENIM_MAX_ITEMS}
                onClick={() => changeQuantity(line.id, line.quantity + 1)}
                className="h-11 w-11 rounded-lg border border-(--color-border) text-xl">+</button>
            </div>
          </div>
        ))}
        <div className="space-y-2 rounded-xl bg-(--color-bg) p-3">
          <label htmlFor="quick-extra-variant" className="block text-sm font-semibold">অন্য কালার বা সাইজের প্যান্ট যোগ করুন</label>
          <div className="flex gap-2">
            <select id="quick-extra-variant" className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-bg) px-2 text-sm"
              value={extraId} onChange={e => setExtraId(e.target.value)}>
              {availableVariants.map(v => <option key={v.id} value={v.id}>{label(v)}</option>)}
            </select>
            <button type="button" disabled={pending || !extraId || count >= QUICK_DENIM_MAX_ITEMS}
              onClick={addAnother} className="min-h-11 rounded-lg bg-stone-900 px-3 text-sm font-semibold text-white disabled:opacity-50">+ যোগ করুন</button>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-(--color-border) p-4 text-sm">
          <div className="flex justify-between"><span>পণ্যের মূল্য ({count} পিস)</span><strong>{taka(subtotal)}</strong></div>
          <div className="flex justify-between"><span>ডেলিভারি চার্জ</span><strong className={count >= 2 ? 'text-emerald-700' : ''}>{count >= 2 ? 'ফ্রি' : shipping === null ? 'ঠিকানা দিলে দেখাবে' : taka(shipping)}</strong></div>
          {count >= 2 ? <p className="rounded-lg bg-emerald-50 p-2 text-center font-semibold text-emerald-800">🎁 ২ পিস অফার: Free Delivery!</p> : null}
          <div className="flex justify-between border-t border-(--color-border) pt-3 text-lg font-bold">
            <span>সর্বমোট</span><span>{total === null ? 'ঠিকানা বাছাই করুন' : taka(total)}</span>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
        <h2 className="text-lg font-bold">📍 ডেলিভারির ঠিকানা</h2>
        <div>
          <label htmlFor="quick-recipient" className="mb-1 block text-sm font-semibold">আপনার নাম *</label>
          <input id="quick-recipient" autoComplete="name" required maxLength={80} value={name} onChange={e=>setName(e.target.value)}
            placeholder="সম্পূর্ণ নাম" className="h-12 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3"/>
        </div>
        <div>
          <label htmlFor="quick-phone" className="mb-1 block text-sm font-semibold">মোবাইল নম্বর *</label>
          <input id="quick-phone" required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)}
            placeholder="01XXXXXXXXX" className="h-12 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3"/>
        </div>
        <div>
          <label htmlFor="quick-district" className="mb-1 block text-sm font-semibold">জেলা *</label>
          <select id="quick-district" required value={district} onChange={e=>{setDistrict(e.target.value);setThanaKey('')}}
            className="h-12 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3">
            <option value="">জেলা নির্বাচন করুন</option>
            {BD_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="quick-thana" className="mb-1 block text-sm font-semibold">থানা / উপজেলা / পোস্ট এলাকা *</label>
          <select id="quick-thana" required disabled={!district} value={thanaKey} onChange={e=>setThanaKey(e.target.value)}
            className="h-12 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 disabled:opacity-50">
            <option value="">থানা নির্বাচন করুন</option>
            {thanaChoices.map(row=><option key={row.key} value={row.key}>{row.upazila} — {row.city}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="quick-address" className="mb-1 block text-sm font-semibold">সম্পূর্ণ ঠিকানা *</label>
          <textarea id="quick-address" required maxLength={160} rows={3} value={address} onChange={e=>setAddress(e.target.value)}
            placeholder="বাসা/গ্রাম, রোড, এলাকা, পোস্ট অফিস, কাছের পরিচিত স্থান" className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) p-3"/>
        </div>
        <div>
          <label htmlFor="quick-email" className="mb-1 block text-sm font-semibold">ইমেইল (ঐচ্ছিক)</label>
          <input id="quick-email" type="email" autoComplete="email" maxLength={120} value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="Email থাকলে দিন" className="h-12 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3"/>
        </div>

        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
          <p className="font-bold">✅ Cash on Delivery (COD)</p>
          <p>পণ্য হাতে পেয়ে কুরিয়ার কর্মীকে টাকা পরিশোধ করবেন।</p>
          <p className="mt-2">এক পিসে ঢাকা সিটির ডেলিভারি ৳৮০, অন্য সব জায়গায় ৳১২০। দুই বা তার বেশি পিসে ডেলিভারি ফ্রি।</p>
        </div>
        {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={disabled}
          className="min-h-14 w-full rounded-xl bg-stone-950 px-4 text-base font-bold text-white disabled:opacity-50">
          {pending ? 'অর্ডার জমা হচ্ছে…' : `COD অর্ডার কনফার্ম করুন${total !== null ? ' — ' + taka(total) : ''}`}
        </button>
        <p className="text-xs leading-5 text-(--color-muted)">
          অর্ডার দেওয়ার মাধ্যমে আপনি আমাদের <Link href="/terms" className="underline">শর্তাবলি</Link> ও <Link href="/returns" className="underline">রিটার্ন নীতি</Link> মেনে নিচ্ছেন।
        </p>
      </form>
    </div>
  )
}
