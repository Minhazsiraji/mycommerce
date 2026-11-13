'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const isQuickCodRoute = (pathname: string) => pathname.startsWith('/order/denim')

/**
 * Route-specific clean checkout chrome.
 * The ordinary storefront header/footer are rendered unchanged on all other routes.
 * No global cart, menu, login, or search interrupts Messenger buyers.
 */
export function ShopHeaderByRoute({
  children,
  logoUrl,
}: {
  children: ReactNode
  logoUrl?: string | null
}) {
  const pathname = usePathname()
  if (!isQuickCodRoute(pathname)) return <>{children}</>

  return (
    <header className="w-full border-b border-slate-200 bg-white text-slate-900">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link href="/order/denim" aria-label="MoyMoy Fashion — ডেনিম অর্ডার"
          className="inline-flex min-w-0 items-center gap-2 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
          {logoUrl ? (
            <Image src={logoUrl} alt="MoyMoy Fashion logo" width={42} height={42}
              className="size-10 shrink-0 rounded-full object-contain" priority />
          ) : (
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-amber-400">M</span>
          )}
          <span className="min-w-0">
            <span className="block text-lg font-extrabold leading-5 tracking-tight sm:text-xl">MoyMoy <span className="text-amber-700">Fashion</span></span>
            <span className="block text-[11px] font-medium leading-4 text-slate-500">Men's Denim Collection</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 text-right text-[11px] font-semibold text-emerald-800 sm:text-sm">
          <span aria-hidden="true">✓</span>
          <span>ক্যাশ অন ডেলিভারি</span>
        </div>
      </div>
    </header>
  )
}

export function ShopFooterByRoute({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (!isQuickCodRoute(pathname)) return <>{children}</>

  return (
    <footer lang="bn" className="mt-auto w-full border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
        <div>
          <p className="text-sm font-bold">MoyMoy Fashion</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">সারা বাংলাদেশে COD · যেকোনো ২ পিসে Free Delivery</p>
        </div>
        <nav aria-label="অর্ডারের তথ্য" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-200">
          <Link href="/track" className="underline-offset-4 hover:underline">অর্ডার ট্র্যাক</Link>
          <Link href="/returns" className="underline-offset-4 hover:underline">রিটার্ন নীতি</Link>
          <Link href="/terms" className="underline-offset-4 hover:underline">শর্তাবলি</Link>
          <Link href="/privacy" className="underline-offset-4 hover:underline">গোপনীয়তা</Link>
        </nav>
      </div>
      <div className="border-t border-slate-800 py-2 text-center text-[11px] text-slate-400">© MoyMoy Fashion · All rights reserved</div>
    </footer>
  )
}
