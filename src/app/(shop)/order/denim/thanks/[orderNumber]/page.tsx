import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { getVisibleOrder } from '@/modules/orders/service'
import { taka } from '@/lib/moymoy-quick-cod'

export const metadata: Metadata = {
  title: 'অর্ডার গ্রহণ করা হয়েছে | MoyMoy Fashion',
  robots: { index: false, follow: false },
}

export default async function QuickDenimThanks({
  params,
}: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const order = await getVisibleOrder(orderNumber)
  if (!order || order.paymentMethod !== 'cod') notFound()

  return (
    <section lang="bn" className="mx-auto max-w-lg space-y-5 pb-20 text-center">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
        <div className="text-5xl">✅</div>
        <h1 className="mt-3 text-2xl font-bold">আপনার অর্ডারটি গ্রহণ করা হয়েছে!</h1>
        <p className="mt-2 text-sm">MoyMoy Fashion-এ অর্ডার করার জন্য ধন্যবাদ। প্রয়োজনে আমরা মোবাইলে যোগাযোগ করব।</p>
      </div>
      <div className="space-y-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 text-left">
        <div className="flex justify-between gap-2"><span>অর্ডার নম্বর</span><strong className="break-all">{order.orderNumber}</strong></div>
        <div className="flex justify-between"><span>পণ্যের মূল্য</span><strong>{taka(order.subtotal)}</strong></div>
        <div className="flex justify-between"><span>ডেলিভারি চার্জ</span><strong>{order.shippingCost === 0 ? 'ফ্রি' : taka(order.shippingCost)}</strong></div>
        <div className="flex justify-between border-t border-(--color-border) pt-3 text-lg font-bold"><span>মোট পরিশোধ</span><span>{taka(order.total)}</span></div>
        <p className="rounded-lg bg-(--color-bg) p-3 text-sm">পেমেন্ট পদ্ধতি: Cash on Delivery — পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন।</p>
      </div>
      <p className="text-sm text-(--color-muted)">আপনার অর্ডার নম্বরটি সংরক্ষণ করুন।</p>
      <Link href="/order/denim" className="inline-block rounded-xl bg-stone-950 px-6 py-3 font-semibold text-white">আরও ডেনিম দেখুন</Link>
    </section>
  )
}
