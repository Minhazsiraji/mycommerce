'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function CategoryError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Category page failed', error) }, [error])
  return <section tabIndex={-1} className="rounded-(--radius-xl) border border-(--feedback-danger-border) bg-(--feedback-danger-surface) px-6 py-16 text-center focus:outline-none"><h1 className="text-2xl font-semibold text-(--feedback-danger-text)">We couldn’t load this category</h1><p className="mt-2 text-(--text-secondary)">Please try again. Your cart and account have not been changed.</p><div className="mt-6 flex justify-center gap-3"><button type="button" onClick={reset} className="min-h-11 rounded-(--radius-md) bg-(--action-primary) px-5 font-medium text-(--action-primary-text)">Try again</button><Link href="/" className="flex min-h-11 items-center rounded-(--radius-md) border px-5 font-medium">Browse store</Link></div></section>
}
